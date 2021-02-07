import datetime
import decimal
from typing import cast, List

from bespoke.enums.loan_status_enum import LoanStatusEnum
from bespoke.db import models
from bespoke.db.models import session_scope
from bespoke.finance.payments import advance_util
from bespoke.finance.payments import payment_util
from bespoke.finance import number_util

from bespoke_test.db import db_unittest
from bespoke_test.db import test_helper

class TestFundLoansWithAdvance(db_unittest.TestCase):

	def test_failure_advance(self) -> None:
		# TODO(dlluncor): Write failure cases when an advance should be rejected
		pass

	def test_successful_advance(self) -> None:
		session_maker = self.session_maker
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()

		# TODO(dlluncor): Test when a bank is approving loans from multiple different companies
		amounts = [10.01, 20.02]
		loan_ids = []
		with session_scope(session_maker) as session:
			for amount in amounts:
				loan = models.Loan(
					company_id=seed.get_company_id('company_admin'),
					amount=decimal.Decimal(amount)
				)
				session.add(loan)
				session.flush()
				loan_ids.append(str(loan.id))

		resp, err = advance_util.fund_loans_with_advance(
			bank_admin_user_id=seed.get_user_id('bank_admin'), 
			loan_ids=loan_ids, 
			payment_input=payment_util.PaymentInsertInputDict(
				company_id='unused',
				type='unused',
				amount=30.03,
				method='ach',
				deposit_date='unused'
			), 
			session_maker=session_maker
		)
		self.assertEqual('OK', resp.get('status'), msg=err)

		# Run validations
		with session_scope(session_maker) as session:
			loans = cast(
				List[models.Loan],
				session.query(models.Loan).filter(
					models.Loan.id.in_(loan_ids)
				).all())
			loans = [loan for loan in loans]
			loans.sort(key=lambda l: l.amount) # sort in increasing amounts to match order of amounts array

			for i in range(len(amounts)):
				amount = amounts[i]
				loan = loans[i]
				self.assertAlmostEqual(amount, float(loan.amount))
				self.assertAlmostEqual(amount, float(loan.outstanding_principal_balance))
				self.assertAlmostEqual(0.0, float(loan.outstanding_interest))
				self.assertAlmostEqual(0.0, float(loan.outstanding_fees))
				self.assertEqual(LoanStatusEnum.Funded, loan.status)

			# TODO(dlluncor): Test that transactions were created successfully

