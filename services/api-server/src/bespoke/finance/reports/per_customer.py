"""
  Per customer fetching of financial information.
"""
import logging
import xlwt

from typing import List

from bespoke.db import db_constants
from bespoke.excel import excel_writer
from bespoke.date import date_util
from bespoke.finance import number_util
from bespoke.finance import contract_util
from bespoke.finance.types import per_customer_types

class ExcelCreator(object):

	def __init__(self, financials: per_customer_types.CustomerFinancials) -> None:
		self.wb = excel_writer.WorkbookWriter(xlwt.Workbook())
		self._financials = financials
		#self._product_type = self._financials['company_settings']['product_type']

	def _summary(self) -> None:
		sheet = self.wb.add_sheet('Summary')

	def _advances(self) -> None:
		sheet = self.wb.add_sheet('Advances')
		
		payments = self._financials['financials']['payments']
		sheet.add_row(['Type', 'Amount', 'Method', 'Submitted'])
		for payment in payments:
			if payment['type'] != db_constants.PaymentType.ADVANCE:
				continue
			row: List[str] = [
				payment['type'], 
				number_util.to_dollar_format(payment['amount']),
				payment['method'], 
				date_util.human_readable_yearmonthday(payment['submitted_at'])
			]
			sheet.add_row(row)


	def _payments(self) -> None:
		sheet = self.wb.add_sheet('Payments')

		payments = self._financials['financials']['payments']
		sheet.add_row(['Type', 'Amount', 'Method', 'Submitted'])
		for payment in payments:
			if payment['type'] != db_constants.PaymentType.REPAYMENT:
				continue
			row: List[str] = [
				payment['type'], 
				number_util.to_dollar_format(payment['amount']),
				payment['method'], 
				date_util.human_readable_yearmonthday(payment['submitted_at'])
			]
			sheet.add_row(row)

	def _contract(self) -> None:
		sheet = self.wb.add_sheet('Contract')
		contract_dicts = self._financials['financials']['contracts']

		for contract_dict in contract_dicts:
			contract, err = contract_util.Contract.build(contract_dict, validate=False)
			if err:
				logging.error('Error reading contract for {}'.format(self._financials['company_info']['id']))
				continue

			sheet.add_row(['Start Date', 'End Date'])
			sheet.add_row([
				date_util.date_to_str(contract_dict['start_date']), 
				date_util.date_to_str(contract_dict['end_date'])
			])

			fields = contract.get_fields()
			sheet.add_row(['Name', 'Value'])
			for field in fields:
				val_to_show = ''
				if field['value']:
					val_to_show = '{}'.format(field['value'])
				sheet.add_row([field['name'], val_to_show])

			sheet.add_row([])


	def populate(self) -> None:
		self._summary()
		self._advances()
		self._payments()
		self._contract()

		