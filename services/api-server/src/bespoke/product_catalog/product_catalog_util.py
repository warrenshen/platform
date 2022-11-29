import uuid
from bespoke import errors
from bespoke.db import models
from sqlalchemy.orm.session import Session
from typing import Tuple, cast

def create_update_bespoke_catalog_brand(
	session: Session,
	id: str,
	brand_name: str,
	us_state: str,
) -> Tuple[str, errors.Error]:
	brand = cast(
		models.BespokeCatalogBrand,
		session.query(models.BespokeCatalogBrand).filter(
			models.BespokeCatalogBrand.id == id
		).first())

	if not brand:
		brand = models.BespokeCatalogBrand(
			id = id,
			brand_name = brand_name,
			us_state = us_state
		)
		session.add(brand)
	else:
		brand.brand_name = brand_name
		brand.us_state = us_state
	
	return str(brand.id), None

def create_update_bespoke_catalog_sku(
	session: Session,
	id: str,
	sku: str,
	brand_id: str,
) -> Tuple[str, errors.Error]:
	sku_model = cast(
		models.BespokeCatalogSku,
		session.query(models.BespokeCatalogSku).filter(
			models.BespokeCatalogSku.id == id
		).first())

	if not sku_model:
		sku_model = models.BespokeCatalogSku(# type: ignore
			id = id,
			sku = sku,
			bespoke_catalog_brand_id = brand_id,
		)
		session.add(sku_model)
	else:
		sku_model.sku = sku
		sku_model.bespoke_catalog_brand_id = brand_id # type: ignore
	
	return str(sku_model.id), None

def delete_bespoke_catalog_brand(
	session: Session,
	id: str,
) -> Tuple[bool, errors.Error]:
	brand = cast(
		models.BespokeCatalogBrand,
		session.query(models.BespokeCatalogBrand).filter(
			models.BespokeCatalogBrand.id == id
		).first())

	if brand: 
		brand.is_deleted = True

	return True, None

def delete_bespoke_catalog_sku(
	session: Session,
	id: str,
) -> Tuple[bool, errors.Error]:
	sku = cast(
		models.BespokeCatalogSku,
		session.query(models.BespokeCatalogSku).filter(
			models.BespokeCatalogSku.id == id
		).first()
	)

	if sku:
		sku.is_deleted = True

	return True, None

def create_update_metrc_to_sku(
	session: Session,
	id: str,
	bespoke_catalog_sku_id: str,
	product_name: str,
	product_category_name: str,
	sku_confidence: str,
	brand_confidence: str,
) -> Tuple[str, errors.Error]:
	metrc_to_sku = cast(
		models.MetrcToBespokeCatalogSku,
		session.query(models.MetrcToBespokeCatalogSku).filter(
			models.MetrcToBespokeCatalogSku.id == id
		).first())

	if not metrc_to_sku:
		metrc_to_sku = models.MetrcToBespokeCatalogSku(# type: ignore
			# id = id,
			bespoke_catalog_sku_id = bespoke_catalog_sku_id,
			product_name = product_name,
			product_category_name = product_category_name,
			sku_confidence = sku_confidence.lower(),
		)
		session.add(metrc_to_sku)
	else:
		metrc_to_sku.bespoke_catalog_sku_id = bespoke_catalog_sku_id # type: ignore
		metrc_to_sku.product_name = product_name
		metrc_to_sku.product_category_name = product_category_name
		metrc_to_sku.sku_confidence = sku_confidence.lower()
	
	return str(metrc_to_sku.id), None

def delete_metrc_to_bespoke_catalog_sku(
	session: Session,
	id: str,
) -> Tuple[bool, errors.Error]:
	metrc_to_sku = cast(
		models.MetrcToBespokeCatalogSku,
		session.query(models.MetrcToBespokeCatalogSku).filter(
			models.MetrcToBespokeCatalogSku.id == id
		).first()
	)

	if metrc_to_sku:
		metrc_to_sku.is_deleted = True

	return True, None
