import datetime
from dateutil import parser
from typing import Any, Union, Tuple, cast

from bespoke.db.db_constants import DeliveryType
from bespoke.inventory.analysis.shared.inventory_types import (
	TransferPackageDict,
	PricingDataConfigDict
)

def print_if(s: str, predicate: bool) -> None:
	if predicate:
		print(s)

def is_time_null(cur_time: Any) -> bool:
	if not cur_time:
		return True

	cur_time_str = str(cur_time)
	return cur_time_str == 'NaT' or cur_time_str == 'NaTType'

def date_to_str(dt: Union[datetime.datetime, datetime.date]) -> str:
	if not dt:
		return ''
	return dt.strftime('%m/%d/%Y')

def parse_to_datetime(cur_datetime: Any) -> datetime.datetime:
	if not cur_datetime:
		return None

	cur_type = type(cur_datetime)

	if cur_type == str:
		return parser.parse(cast(str, cur_datetime))
	elif str(cur_type) == "<class 'pandas._libs.tslibs.timestamps.Timestamp'>":
		return cur_datetime.to_pydatetime()
	elif is_time_null(cur_datetime):
		return None

	return cast(datetime.datetime, cur_datetime)

def parse_to_date(cur_date: Any) -> datetime.date:
	if not cur_date:
		return None

	cur_type = type(cur_date)

	if cur_type == str:
		return parser.parse(cast(str, cur_date)).date()
	elif cur_type == datetime.datetime:
		cur_date = cast(datetime.datetime, cur_date).date()
	elif str(cur_type) == "<class 'pandas._libs.tslibs.timestamps.Timestamp'>":
		cur_date = cur_date.date()
	elif is_time_null(cur_date):
		return None

	return cast(datetime.date, cur_date)

def is_incoming(transfer_pkg: TransferPackageDict) -> bool:
	# For the purposes of this inventory exercise, incoming means its
	# still in the posession of the company

	return transfer_pkg['delivery_type'] in set([
		DeliveryType.INTERNAL, 
		DeliveryType.INCOMING_INTERNAL, 
		DeliveryType.OUTGOING_INTERNAL,
		DeliveryType.INCOMING_FROM_VENDOR,
		DeliveryType.INCOMING_UNKNOWN
	])

def is_outgoing(transfer_pkg: TransferPackageDict) -> bool:
	# For the purposes of this inventory exercise, outgoing means its
	# no onger in the posession of the company
	return transfer_pkg['delivery_type'] in set([
		DeliveryType.OUTGOING_TO_PAYOR,
		DeliveryType.OUTGOING_UNKNOWN
	])

def get_estimated_price_per_unit_of_measure(
	product_category_name: str,
	unit_of_measure: str,
	external_pricing_data_config: PricingDataConfigDict
) -> Tuple[float, str]:

	if product_category_name not in external_pricing_data_config['category_to_fixed_prices']:
		return None, f"WARN: Could not find {product_category_name} in the external pricing data config"

	pricing_for_category = external_pricing_data_config['category_to_fixed_prices'][product_category_name]
	if unit_of_measure.lower() not in pricing_for_category:
		return None, f"WARN: Could not find {unit_of_measure.lower()} in the external pricing table for category {product_category_name}"

	price = pricing_for_category[unit_of_measure.lower()]
	return price, None

