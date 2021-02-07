import datetime
import decimal

from bespoke.db import models
from bespoke.db.models import session_scope

from bespoke_test.db import db_unittest

def make_customer(prefix: str) -> models.Customer:
	return models.Customer(
		name=prefix + '-name',
		phone='310-888-8888',
		email=prefix + '@gmail.com'
	)

class TestWorkflows(db_unittest.TestCase):

	def test_po_actions(self) -> None:
		session_maker = self.session_maker

		# Create the customer
		customer1 = make_customer('customer1')
		customer_name = customer1.name
		with session_scope(session_maker) as session:
			session.add(customer1)

		# Customer creates the purchase order
		po_number = 'po_12345678'
		with session_scope(session_maker) as session:
			session.add(models.PurchaseOrder(
				order_number=po_number,
				amount=decimal.Decimal(3000.02)
			))

		# Checks based on first couple DB queries
		with session_scope(session_maker) as session:
			query_customer1 = session.query(models.Customer).first()
			self.assertEqual(customer_name, query_customer1.name)

			po = session.query(models.PurchaseOrder).filter(
				models.PurchaseOrder.order_number == po_number).first()
			self.assertIsNone(po.approved_at)

		# Anchor confirms the purchase order
		with session_scope(session_maker) as session:
			po = session.query(models.PurchaseOrder).filter(
				models.PurchaseOrder.order_number == po_number).first()
			po.approved_at = datetime.datetime.now()

		# Checks

		with session_scope(session_maker) as session:
			po = session.query(models.PurchaseOrder).filter(
				models.PurchaseOrder.order_number == po_number).first()
			self.assertIsNotNone(po.approved_at)
