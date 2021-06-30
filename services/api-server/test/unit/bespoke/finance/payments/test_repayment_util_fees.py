import uuid
from typing import Any, Dict, List, cast

from bespoke.date import date_util
from bespoke.db import db_constants, models
from bespoke.db.models import session_scope
from bespoke.finance.payments import payment_util, repayment_util_fees
from bespoke_test.db import db_unittest, test_helper
from bespoke_test.finance import finance_test_helper
from bespoke.finance.types import payment_types

class TestRepaymentOfFees(db_unittest.TestCase):

	def _run_test(self, test: Dict) -> None:
		self.reset()
		session_maker = self.session_maker
		seed = test_helper.BasicSeed.create(self.session_maker, self)
		seed.initialize()

		company_id = seed.get_company_id('company_admin', index=0)

		with session_scope(session_maker) as session:
			user_id = seed.get_user_id('company_admin', index=0)
			payment_input_amount = test['payment_amount']
			items_covered: payment_types.PaymentItemsCoveredDict = {
				'requested_to_account_fees': payment_input_amount
			}
			payment_date = date_util.load_date_str(test['requested_payment_date'])

			financial_summary = finance_test_helper.get_default_financial_summary(
				total_limit=0.0,
				available_limit=0.0,
				product_type=db_constants.ProductType.INVENTORY_FINANCING
			)
			financial_summary.company_id = company_id
			financial_summary.account_level_balance_payload = {'fees_total': test['fees_total']}
			session.add(financial_summary)

			payment_id, err = repayment_util_fees.create_and_add_account_level_fee_repayment(
				company_id=company_id,
				payment_input=payment_types.RepaymentPaymentInputDict(
					payment_method=test['payment_method'],
					requested_amount=payment_input_amount,
					requested_payment_date=payment_date,
					payment_date=None,
					items_covered=items_covered,
					company_bank_account_id=test['company_bank_account_id'],
					customer_note=''
				),
				created_by_user_id=user_id,
				session=session)
			self.assertIsNone(err)

		with session_scope(session_maker) as session:
			payment = cast(
				models.Payment,
				session.query(models.Payment).filter(
					models.Payment.id == payment_id
				).first())

			# Assertions on the payment
			self.assertAlmostEqual(payment_input_amount, float(payment.requested_amount))
			self.assertEqual(db_constants.PaymentType.REPAYMENT_OF_ACCOUNT_FEE, payment.type)
			self.assertEqual(company_id, str(payment.company_id))
			self.assertEqual(test['payment_method'], payment.method)
			self.assertIsNotNone(payment.submitted_at)
			self.assertEqual(user_id, str(payment.submitted_by_user_id))
			self.assertEqual(user_id, str(payment.requested_by_user_id))
			self.assertEqual(payment_date, payment.requested_payment_date)
			self.assertIsNone(payment.settlement_date)
			self.assertEqual(items_covered, cast(Dict, payment.items_covered))
			self.assertEqual(test['company_bank_account_id'], str(payment.company_bank_account_id) if payment.company_bank_account_id else None)

			# Now settle the repayment
			settle = test['settlement']

			tx_ids, err = repayment_util_fees.settle_repayment_of_fee(
				req=repayment_util_fees.SettleRepayFeeReqDict(
					company_id=company_id,
					payment_id=payment_id,
					amount=settle['amount'],
					deposit_date=settle['deposit_date'],
					settlement_date=settle['settlement_date'],
					items_covered=payment_types.PaymentItemsCoveredDict(
						to_account_fees=settle['to_account_fees'],
						to_user_credit=settle['to_user_credit']
					)
				),
				should_settle_payment=True,
				user_id=user_id,
				session=session
			)
		self.assertIsNone(err)
		self.assertIsNotNone(tx_ids)

		with session_scope(session_maker) as session:
			payment = cast(
				models.Payment,
				session.query(models.Payment).filter(
					models.Payment.id == payment_id
				).first())

			txs = cast(
				List[models.Transaction],
				session.query(models.Transaction).filter(
					models.Transaction.id.in_(tx_ids)
				).all())
			txs = [tx for tx in txs]
			txs.sort(key=lambda t: t.amount)

			self.assertAlmostEqual(payment_input_amount, float(payment.requested_amount))
			self.assertEqual(db_constants.PaymentType.REPAYMENT_OF_ACCOUNT_FEE, payment.type)
			self.assertEqual(company_id, str(payment.company_id))
			self.assertEqual(test['payment_method'], payment.method)
			self.assertIsNotNone(payment.submitted_at)
			self.assertEqual(payment_date, payment.requested_payment_date)

			self.assertIsNotNone(payment.settled_at)
			self.assertEqual(user_id, str(payment.settled_by_user_id))
			self.assertIsNotNone(payment.settlement_identifier)
			self.assertEqual(date_util.load_date_str(settle['deposit_date']), payment.deposit_date)
			self.assertEqual(date_util.load_date_str(settle['settlement_date']), payment.settlement_date)
			self.assertEqual(items_covered, cast(Dict, payment.items_covered))

			self.assertEqual(len(test['expected_transactions']), len(txs))
			for i in range(len(txs)):
				tx = txs[i]
				expected_tx = test['expected_transactions'][i]
				self.assertEqual(expected_tx['amount'], float(tx.amount))
				self.assertEqual(expected_tx['type'], tx.type)
				self.assertEqual(payment_id, str(tx.payment_id))
				self.assertEqual(date_util.load_date_str(settle['settlement_date']), tx.effective_date)


	def test_add_repayment_of_fees(self) -> None:
		test: Dict = {
				'payment_amount': 30.1,
				'payment_method': 'ach',
				'requested_payment_date': '10/10/2019',
				'fees_total': 30.0,
				'company_bank_account_id': str(uuid.uuid4()),
				'settlement': {
					'amount': 30.1,
					'to_account_fees': 30.0,
					'to_user_credit': 0.1,
					'deposit_date': '10/12/2019',
					'settlement_date': '10/14/2019'
				},
				'expected_transactions': [
					{
						'type': db_constants.PaymentType.CREDIT_TO_USER,
						'amount': 0.1
					},
					{
						'type': db_constants.PaymentType.REPAYMENT_OF_ACCOUNT_FEE,
						'amount': 30.0
					}
				]
			}
		self._run_test(test)
