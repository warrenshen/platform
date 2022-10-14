"""
DATABASE_URL=postgres+psycopg2://postgres:postgrespassword@localhost:5432/postgres python scripts/backfill/
"""

import os
import sys
from os import path
from typing import List, cast, Tuple

sys.path.append(path.realpath(path.join(path.dirname(__file__), "../../src")))
sys.path.append(path.realpath(path.join(path.dirname(__file__), "../")))

from sqlalchemy.orm.session import Session

from bespoke import errors
from bespoke.db import db_constants, models, queries
from bespoke.finance import number_util


def main() -> None:
	engine = models.create_engine()
	session_maker = models.new_sessionmaker(engine)

	current_page = 0
	BATCH_SIZE = 100
	is_done = False
	while not is_done:
		with models.session_scope(session_maker) as session:
			print(f'[Page {current_page + 1}] Calculating purchase_orders.new_purchase_order_status...')
			purchase_orders = cast(
				List[models.PurchaseOrder],
				session.query(models.PurchaseOrder).order_by(
					models.PurchaseOrder.order_date.desc()
				).offset(
					current_page * BATCH_SIZE
				).limit(BATCH_SIZE).all()
			)

			if len(purchase_orders) == 0:
				is_done = True
				break

			for purchase_order in purchase_orders:
				new_status, err = calculate_new_purchase_order_status(session, purchase_order)
				if err:
					print(f'Skipping purchase order {purchase_order.id} because of error: {err}')
					continue

				if new_status is not None:
					print(f'Changeing purchase order with id {purchase_order.id} from {purchase_order.status} to {new_status}')
					purchase_order.new_purchase_order_status = new_status
			
			current_page += 1


def calculate_new_purchase_order_status(
	session: Session, 
	purchase_order: models.PurchaseOrder
) -> Tuple[ str, errors.Error ]:
	# requestStatusEnum.DRAFTED => DRAFT (58)
	if purchase_order.status == db_constants.RequestStatusEnum.DRAFTED:
		return db_constants.NewPurchaseOrderStatus.DRAFT, None
	
	# requestStatusEnum.INCOMPLETE => CHANGES_REQEUESTED_BY_BESPOKE (1)
	if purchase_order.status == db_constants.RequestStatusEnum.INCOMPLETE:
		return db_constants.NewPurchaseOrderStatus.CHANGES_REQUESTED_BY_BESPOKE, None

	# requestStatusEnum.APPROVAL_REQUESTED => PENDING_APPROVAL_BY_VENDOR (94)
	elif purchase_order.status == db_constants.RequestStatusEnum.APPROVAL_REQUESTED:
		return db_constants.NewPurchaseOrderStatus.PENDING_APPROVAL_BY_VENDOR, None
	
	# REJECTED => REJECTED_BY_VENDOR || REJECTED_BY_BESPOKE (26)
	elif purchase_order.status == db_constants.RequestStatusEnum.REJECTED:
		rejecting_user, err = queries.get_user_by_id(
			session,
			purchase_order.rejected_by_user_id
		)
		if err:
			# vendor rejection won't record a user id
			is_bank_user = False
		else:
			is_bank_user = db_constants.is_bank_user([rejecting_user.role])

		if is_bank_user:
			return db_constants.NewPurchaseOrderStatus.REJECTED_BY_BESPOKE, None
		else:
			return db_constants.NewPurchaseOrderStatus.REJECTED_BY_VENDOR, None
	
	# closed_at is not None => CLOSED (25)
	elif purchase_order.closed_at is not None:
		return db_constants.NewPurchaseOrderStatus.ARCHIVED, None
	
	# ALL FULLY FUNDED POs => ARCHIVED (4081)
	elif purchase_order.status == db_constants.RequestStatusEnum.APPROVED and number_util.float_eq(purchase_order.amount or 0, purchase_order.amount_funded or 1) and purchase_order.funded_at:
		return db_constants.NewPurchaseOrderStatus.ARCHIVED, None
	
	# APPROVED but not fully funded => depenedent on loans (647)
	elif purchase_order.status == db_constants.RequestStatusEnum.APPROVED and not number_util.float_eq(purchase_order.amount or 0, purchase_order.amount_funded or 1):
		loans = cast(
			List[models.Loan],
			session.query(models.Loan).filter(
				models.Loan.artifact_id == purchase_order.id,
				models.Loan.is_deleted == None
			).all()
		)
		# loans that fund partial amount doesn't impact new status
		all_loan_statuses = set([loan.status for loan in loans if not loan.funded_at])
		
		# any loan pending approval => FINANCING_PENDING_APPROVAL
		if db_constants.LoanStatusEnum.APPROVAL_REQUESTED in all_loan_statuses:
			return db_constants.NewPurchaseOrderStatus.FINANCING_PENDING_APPROVAL, None
		
		# approved & not yet funded and no pending approval loans => FINANCING_REQUEST_APPROVED
		if db_constants.LoanStatusEnum.APPROVAL_REQUESTED not in all_loan_statuses and db_constants.LoanStatusEnum.APPROVED in all_loan_statuses:
			return db_constants.NewPurchaseOrderStatus.FINANCING_REQUEST_APPROVED, None
		
			# partialy funded or 0 loans yet => READY_TO_REQUEST_FINANCING
		if len(all_loan_statuses) == 0:
			return db_constants.NewPurchaseOrderStatus.READY_TO_REQUEST_FINANCING, None

		return None, errors.Error(f'could not determine new status for purchase order id: {purchase_order.id}')
	
	else:
		return None, errors.Error(f'could not determine new status for purchase order id: {purchase_order.id}')


if __name__ == "__main__":
	if not os.environ.get("DATABASE_URL"):
		print("You must set 'DATABASE_URL' in the environment to use this script")
		exit(1)

	is_test_run = True

	if not os.environ.get("CONFIRM"):
		print("This script CHANGES information in the database")
		print("You must set 'CONFIRM=1' as an environment variable to actually perform database changes with this script")
	else:
		is_test_run = False

	main()
