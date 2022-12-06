import uuid
from typing import cast
from bespoke.db import models
from bespoke.db.models import session_scope
from bespoke.product_catalog import product_catalog_util
from bespoke_test.db import db_unittest
from sqlalchemy.orm.session import Session

def setup_brand(
	session: Session,
	brand_name: str,
) -> str:
	brand = models.BespokeCatalogBrand(
		id = uuid.uuid4(),
		brand_name = brand_name,
	)
	session.add(brand)
	return brand.id


class TestCreateUpdateBespokeCatalogBrandView(db_unittest.TestCase):
	def test_create_brand(self) -> None:
		with session_scope(self.session_maker) as session:
			brand_name = 'Test Brand'

			brand_id, err = product_catalog_util.create_update_bespoke_catalog_brand(
				id=None,
				session=session,
				brand_name=brand_name,
			)

			brand = cast(
				models.BespokeCatalogBrand,
				session.query(models.BespokeCatalogBrand).filter_by(
					id=brand_id
				).first()
			)

			self.assertEqual(err, None)
			self.assertEqual(brand.brand_name, brand_name)

	def test_update_brand(self) -> None:
		with session_scope(self.session_maker) as session:
			brand_id = setup_brand(
				session=session,
				brand_name='Test Brand',
			)

			new_brand_name = 'Gucci'
			brand_id, err = product_catalog_util.create_update_bespoke_catalog_brand(
				session=session,
				id=brand_id,
				brand_name=new_brand_name,
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
