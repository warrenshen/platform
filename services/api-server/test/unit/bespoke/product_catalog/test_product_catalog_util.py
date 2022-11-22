import uuid
from typing import cast
from bespoke.db import models
from bespoke.db.models import session_scope
from bespoke.product_catalog import product_catalog_util
from bespoke_test.db import db_unittest
from sqlalchemy.orm.session import Session
from pprint import pprint

def setup_brand(
	session: Session,
	brand_name: str,
	us_state: str,
) -> str:
	brand = models.BespokeCatalogBrand(
		id = uuid.uuid4(),
		brand_name = brand_name,
		us_state = us_state
	)
	session.add(brand)
	return brand.id


class TestCreateUpdateBespokeCatalogBrandView(db_unittest.TestCase):
	def test_create_brand(self) -> None:
		with session_scope(self.session_maker) as session:
			new_brand_id = str(uuid.uuid4())
			brand_name = 'Test Brand'
			us_state = 'CA'

			brand_id, err = product_catalog_util.create_update_bespoke_catalog_brand(
				session=session,
				id=new_brand_id,
				brand_name=brand_name,
				us_state=us_state,
			)

			brand = cast(
				models.BespokeCatalogBrand,
				session.query(models.BespokeCatalogBrand).filter_by(
					id=brand_id
				).first()
			)

			self.assertEqual(err, None)
			self.assertEqual(str(brand.id), new_brand_id)
			self.assertEqual(brand.brand_name, brand_name)
			self.assertEqual(brand.us_state, us_state)

	def test_update_brand(self) -> None:
		with session_scope(self.session_maker) as session:
			brand_id = setup_brand(
				session=session,
				brand_name='Test Brand',
				us_state='CA',
			)

			new_brand_name = 'Gucci'
			new_state = 'NY'
			brand_id, err = product_catalog_util.create_update_bespoke_catalog_brand(
				session=session,
				id=brand_id,
				brand_name=new_brand_name,
				us_state=new_state,
			)

			brand = cast(
				models.BespokeCatalogBrand,
				session.query(models.BespokeCatalogBrand).filter_by(
					id=brand_id
				).first()
			)

			self.assertEqual(err, None)
			self.assertEqual(str(brand.id), brand_id)
			self.assertEqual(brand.brand_name, new_brand_name)
			self.assertEqual(brand.us_state, new_state)


class TestCreateUpdateBespokeCatalogSkuView(db_unittest.TestCase):
	def test_create_sku_with_existing_brand(self) -> None:
		with session_scope(self.session_maker) as session:
			existing_brand_id = setup_brand(
				session=session,
				brand_name='Gucci',
				us_state='NY',
			)

			new_sku_id = str(uuid.uuid4())
			sku = 'flip flops'
			sku_id, err = product_catalog_util.create_update_bespoke_catalog_sku(
				session=session,
				id=new_sku_id,
				sku=sku,
				brand_id=existing_brand_id,
			)

			sku_model = cast(
				models.BespokeCatalogSku,
				session.query(models.BespokeCatalogSku).filter_by(
					id=sku_id
				).first()
			)

			self.assertEqual(err, None)
			self.assertEqual(str(sku_model.id), new_sku_id)
			self.assertEqual(sku_model.sku, sku)
			self.assertEqual(sku_model.bespoke_catalog_brand_id, existing_brand_id)
