import logging
import math
import pandas
import matplotlib.pyplot as plt
from mypy_extensions import TypedDict
from typing import List, Any, cast
from dateutil import parser

from bespoke.inventory.analysis.shared.inventory_types import (
	Query,
	AnalysisParamsDict
)
from bespoke.inventory.analysis import stale_inventory_util

InventoryValuationDict = TypedDict('InventoryValuationDict', {
	'total_valuation': float,
	'total_fresh_valuation': float
})

def get_inventory_valuation(
	inventory_packages_dataframe: pandas.DataFrame,
	incoming_transfer_packages_dataframe: pandas.DataFrame,
	params: AnalysisParamsDict,
) -> InventoryValuationDict:
	inventory_with_incoming_transfer_packages_dataframe = inventory_packages_dataframe \
		.astype({'package_id': 'int64'}) \
		.merge(
			incoming_transfer_packages_dataframe.astype({'package_id': 'int64'}),
			on='package_id',
			how='inner',
			suffixes=('', '_r')
		)

	inventory_with_incoming_transfer_packages_dataframe['packaged_date'] = inventory_with_incoming_transfer_packages_dataframe['arrived_date']
	inventory_with_cost_records = inventory_with_incoming_transfer_packages_dataframe.to_dict('records')

	total_valuation_cost = 0.0
	total_fresh_valuation_cost = 0.0

	for inventory_with_cost_record in inventory_with_cost_records:
		incoming_receiver_price = inventory_with_cost_record['receiver_wholesale_price']
		incoming_received_quantity = inventory_with_cost_record['received_quantity']
		current_quantity = inventory_with_cost_record['quantity']

		# Incoming price and / or quantity may be NaN.
		if math.isnan(incoming_receiver_price) or math.isnan(incoming_received_quantity):
			continue

		cur_valuation_cost = float(current_quantity) * (incoming_receiver_price / incoming_received_quantity)

		total_valuation_cost += cur_valuation_cost
		if not stale_inventory_util.is_package_stale(cast(Any, inventory_with_cost_record), params):
			total_fresh_valuation_cost += cur_valuation_cost

	return InventoryValuationDict(
		total_valuation=total_valuation_cost,
		total_fresh_valuation=total_fresh_valuation_cost
	)

def get_total_valuation_for_date(
	computed_inventory_packages_dataframe: pandas.DataFrame,
	company_incoming_transfer_packages_dataframe: pandas.DataFrame,
	inventory_date: str,
	params: AnalysisParamsDict,
	using_nb: bool) -> InventoryValuationDict:

	in_inventory_computed_inventory_packages_dataframe = computed_inventory_packages_dataframe[computed_inventory_packages_dataframe['is_in_inventory'] == 'true']

	valuation_res = get_inventory_valuation(
		inventory_packages_dataframe=in_inventory_computed_inventory_packages_dataframe,
		incoming_transfer_packages_dataframe=company_incoming_transfer_packages_dataframe,
		params=params
	)

	if using_nb:
		logging.info(f'On {inventory_date} # packages in inventory: {len(in_inventory_computed_inventory_packages_dataframe.index)}, valuation cost: {round(valuation_res["total_valuation"], 2)}')

	return valuation_res

def _get_gmv_for_inventory_dates(
	gmv_by_month_dataframe: pandas.DataFrame,
	q: Query) -> List[float]:

	gmv_dates = list(cast(Any, gmv_by_month_dataframe.index))
	gmv_date_to_val = {}
	for gmv_date in gmv_dates:
		gmv_date_to_val[gmv_date] = gmv_by_month_dataframe[gmv_date]

	specific_gmv_vals = []

	for inventory_date_str in q.inventory_dates:
		inventory_date = parser.parse(inventory_date_str)
		key = inventory_date.strftime('%Y-%m')
		if key in gmv_date_to_val:
			specific_gmv_vals.append(gmv_date_to_val[key])
		else:
			specific_gmv_vals.append(0.0)
	
	return specific_gmv_vals

def plot_inventory_and_revenue(
	q: Query,
	sales_receipts_dataframe: pandas.DataFrame,
	inventory_valuations: List[float],
	fresh_inventory_valuations: List[float],
) -> None:

	# Coerce the receipts dataframe by grouping by month, which gets us the total revenue per month
	receipts_dataframe = sales_receipts_dataframe.copy()
	fn = lambda row: f'{row.sales_datetime.year}-{"0" if row.sales_datetime.month < 10 else ""}{row.sales_datetime.month}'
	col = receipts_dataframe.apply(fn, axis=1)
	receipts_dataframe = receipts_dataframe.assign(sales_month=col.values)
	gmv_by_month_dataframe = receipts_dataframe.groupby(['sales_month'])['total_price'].sum()
	specific_gmv_vals = _get_gmv_for_inventory_dates(gmv_by_month_dataframe, q)

	if len(q.inventory_dates) != len(inventory_valuations):
		logging.error('Inventory dates: len {} != inventory_valuations len {}'.format(
			len(q.inventory_dates), len(inventory_valuations)))
		return

	if len(inventory_valuations) != len(specific_gmv_vals):
		logging.error('inventory_valuations: len {} != gmv_by_month len {}'.format(
			len(q.inventory_dates), len(gmv_by_month_dataframe.array)))
		return

	if len(inventory_valuations) != len(fresh_inventory_valuations):
		logging.error('inventory_valuations: len {} != fresh_inventory_valuations len {}'.format(
			len(inventory_valuations), len(fresh_inventory_valuations)
		))
		return

	df = pandas.DataFrame({
			'x_values': q.inventory_dates,
			'fresh_inventory': fresh_inventory_valuations,
			'inventory': inventory_valuations,
			'revenue': specific_gmv_vals,
	})

	# multiple line plots
	plt.figure(figsize=(24, 12))
	plt.plot( 'x_values', 'fresh_inventory', data=df, marker='o', markerfacecolor='green', markersize=12, color='green', linewidth=4)
	plt.plot( 'x_values', 'inventory', data=df, marker='o', markerfacecolor='blue', markersize=12, color='skyblue', linewidth=4)
	plt.plot( 'x_values', 'revenue', data=df, marker='o', color='olive', linewidth=2)

	# show legend
	plt.legend()

	# show graph
	plt.show()
