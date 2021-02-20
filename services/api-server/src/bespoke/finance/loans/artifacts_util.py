"""
	File that handles logic when listing artifacts that are used as backing
	for a loan.
"""
from typing import Callable, Dict, List, Tuple, cast
from mypy_extensions import TypedDict

from bespoke import errors
from bespoke.date import date_util
from bespoke.db import db_constants, models
from bespoke.db.models import session_scope
from bespoke.finance.loans import sibling_util

ArtifactDict = TypedDict('ArtifactDict', {
	'artifact_id': str, # the artifact ID, e.g., the Purchase Order ID, etc
	'total_amount': float, # total amount associated with the artifact
	'amount_remaining': float # amount left that you can request a loan for
})

ListArtifactsResp = TypedDict('ListArtifactsResp', {
	'artifacts': List[ArtifactDict],
	'status': str
})

def _list_artifacts_for_inventory(
	company_id: str, loan_id: str, session_maker: Callable) -> List[ArtifactDict]:

	with session_scope(session_maker) as session:
		purchase_orders = cast(
			List[models.PurchaseOrder],
			session.query(models.PurchaseOrder).filter(
				models.PurchaseOrder.company_id == company_id
			).all()
		)
		if not purchase_orders:
			return []

		artifacts_by_id = {}
		artifact_ids = []
		for purchase_order in purchase_orders:
			artifact_id = str(purchase_order.id)
			artifact_ids.append(artifact_id)

			artifacts_by_id[artifact_id] = ArtifactDict(
				artifact_id=artifact_id,
				total_amount=float(purchase_order.amount),
				amount_remaining=float(purchase_order.amount)
			)

		used_amounts_per_id = sibling_util.get_loan_sum_per_artifact(
			session, artifact_ids, excluding_loan_id=loan_id)
		for artifact_id, used_amount in used_amounts_per_id.items():
			artifacts_by_id[artifact_id]['amount_remaining'] -= used_amount
			artifacts_by_id[artifact_id]['amount_remaining'] = max(0, artifacts_by_id[artifact_id]['amount_remaining'])
		
		artifacts = list(artifacts_by_id.values())
		return artifacts

def list_artifacts_for_create_loan(
	company_id: str, product_type: str, 
	loan_id: str, session_maker: Callable) -> Tuple[ListArtifactsResp, errors.Error]:
	if product_type not in db_constants.PRODUCT_TYPES:
		return None, errors.Error('Invalid product type provided')

	if product_type == db_constants.ProductType.LINE_OF_CREDIT:
		return ListArtifactsResp(artifacts=[], status='OK'), None
	elif product_type == db_constants.ProductType.INVENTORY_FINANCING:
		artifacts = _list_artifacts_for_inventory(company_id, loan_id, session_maker)
		return ListArtifactsResp(artifacts=artifacts, status='OK'), None

	return None, errors.Error('Invalid product type provided')
