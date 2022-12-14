from bespoke import errors
from bespoke.db import models
from sqlalchemy.orm.session import Session
from typing import Dict, List, Tuple, cast

def create_update_bespoke_catalog_brand(
	session: Session,
	id: str,
	brand_name: str,
) -> Tuple[str, errors.Error]:
	brand = cast(
		models.BespokeCatalogBrand,
		session.query(models.BespokeCatalogBrand).filter(
			models.BespokeCatalogBrand.id == id
		).first())

	if not brand:
		brand = models.BespokeCatalogBrand(
			brand_name = brand_name,
		)
		session.add(brand)
		session.flush()
	else:
		brand.brand_name = brand_name
	
	return str(brand.id), None

def create_update_bespoke_catalog_sku_group(
	session: Session,
	id: str,
	sku_group_name: str,
	brand_id: str,
	unit_quantity: float,
	unit_of_measure: str,
) -> Tuple[str, errors.Error]:
	sku_group = cast(
		models.BespokeCatalogSkuGroup,
		session.query(models.BespokeCatalogSkuGroup).filter(
			models.BespokeCatalogSkuGroup.id == id
		).first())

	if not sku_group:
		sku_group = models.BespokeCatalogSkuGroup(# type: ignore
			sku_group_name = sku_group_name,
			bespoke_catalog_brand_id = brand_id,
			unit_quantity = unit_quantity,
			unit_of_measure = unit_of_measure,
		)
		session.add(sku_group)
		session.flush()
	else:
		sku_group.sku_group_name = sku_group_name
		sku_group.bespoke_catalog_brand_id = brand_id # type: ignore
		sku_group.unit_quantity = unit_quantity # type: ignore
		sku_group.unit_of_measure = unit_of_measure
	
	return str(sku_group.id), None

def create_update_bespoke_catalog_sku(
	session: Session,
	id: str,
	sku: str,
	sku_group_id: str,
) -> Tuple[str, errors.Error]:
	sku_model = cast(
		models.BespokeCatalogSku,
		session.query(models.BespokeCatalogSku).filter(
			models.BespokeCatalogSku.id == id
		).first())

	if not sku_model:
		sku_model = models.BespokeCatalogSku(# type: ignore
			sku = sku,
			bespoke_catalog_sku_group_id = sku_group_id,
		)
		session.add(sku_model)
		session.flush()
	else:
		sku_model.sku = sku
		sku_model.bespoke_catalog_sku_group_id = sku_group_id # type: ignore
	
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
		sku_groups = cast(
			List[models.BespokeCatalogSkuGroup],
			session.query(models.BespokeCatalogSkuGroup).filter(
				models.BespokeCatalogSkuGroup.bespoke_catalog_brand_id == brand.id
			).filter(
				models.BespokeCatalogSkuGroup.is_deleted == False
			).all())
		if len(sku_groups) == 0:
			brand.is_deleted = True
			return True, None
		else:
			return False, errors.Error(f"Cannot delete brand: {brand.brand_name} becaused it's associated with the following sku groups: {[sku_group.sku_group_name for sku_group in sku_groups]}")

	return True, None

def delete_bespoke_catalog_sku_group(
	session: Session,
	id: str,
) -> Tuple[bool, errors.Error]:
	sku_group = cast(
		models.BespokeCatalogSkuGroup,
		session.query(models.BespokeCatalogSkuGroup).filter(
			models.BespokeCatalogSkuGroup.id == id
		).first())

	if sku_group:
		skus = cast(
			List[models.BespokeCatalogSku],
			session.query(models.BespokeCatalogSku).filter(
				models.BespokeCatalogSku.bespoke_catalog_sku_group_id == sku_group.id
			).filter(
				models.BespokeCatalogSku.is_deleted == False
			).all())
		if len(skus) == 0:
			sku_group.is_deleted = True
			return True, None
		else:
			return False, errors.Error(f"Cannot delete SKU group: {sku_group.sku_group_name} becaused it's associated with the following skus: {[sku.sku for sku in skus]}")

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
		metrc_to_sku = cast(
			List[models.MetrcToBespokeCatalogSku],
			session.query(models.MetrcToBespokeCatalogSku).filter(
				models.MetrcToBespokeCatalogSku.bespoke_catalog_sku_id == sku.id
			).filter(
				models.MetrcToBespokeCatalogSku.is_deleted == False
			).all())
		if len(metrc_to_sku) == 0:
			sku.is_deleted = True
			return True, None
		else:
			return False, errors.Error(f"Cannot delete SKU: {sku.sku} becaused it's associated with the following Metrc to SKU mappings: {[metrc_to_sku.product_name for metrc_to_sku in metrc_to_sku]}")

	return True, None

def create_update_metrc_to_sku(
	session: Session,
	id: str,
	bespoke_catalog_sku_id: str,
	product_name: str,
	product_category_name: str,
	sku_confidence: str,
	last_edited_by_user_id: str,
	wholesale_quantity: int,
	is_sample: bool,
) -> Tuple[str, errors.Error]:
	metrc_to_sku = cast(
		models.MetrcToBespokeCatalogSku,
		session.query(models.MetrcToBespokeCatalogSku).filter(
			models.MetrcToBespokeCatalogSku.id == id
		).first())

	if not metrc_to_sku:
		metrc_to_sku = models.MetrcToBespokeCatalogSku(# type: ignore
			bespoke_catalog_sku_id = bespoke_catalog_sku_id,
			product_name = product_name,
			product_category_name = product_category_name,
			sku_confidence = sku_confidence.lower(),
			last_edited_by_user_id = last_edited_by_user_id,
			wholesale_quantity = wholesale_quantity,
			is_sample = is_sample,
		)
		session.add(metrc_to_sku)
		session.flush()
	else:
		metrc_to_sku.bespoke_catalog_sku_id = bespoke_catalog_sku_id # type: ignore
		if product_name:
			metrc_to_sku.product_name = product_name
		if product_category_name:
			metrc_to_sku.product_category_name = product_category_name
		metrc_to_sku.sku_confidence = sku_confidence.lower()
		metrc_to_sku.last_edited_by_user_id = last_edited_by_user_id # type: ignore
		if wholesale_quantity:
			metrc_to_sku.wholesale_quantity = wholesale_quantity
		metrc_to_sku.is_sample = is_sample
	
	return str(metrc_to_sku.id), None

def create_invalid_or_sample_metrc_to_sku_multiple(
	session: Session,
	data: List[Dict[str, str]],
	is_sample: bool,
	last_edited_by_user_id: str,
) -> Tuple[bool, errors.Error]:
	metrc_to_sku_models = [models.MetrcToBespokeCatalogSku(# type: ignore
		product_name = metrc_entry['product_name'],
		product_category_name = metrc_entry['product_category_name'],
		sku_confidence = metrc_entry['sku_confidence'].lower(),
		is_sample = is_sample,
		last_edited_by_user_id = last_edited_by_user_id,
	) for metrc_entry in data]
	session.add_all(metrc_to_sku_models)
	return True, None

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
