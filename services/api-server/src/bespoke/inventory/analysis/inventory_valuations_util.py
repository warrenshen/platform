import math
import pandas
import matplotlib.pyplot as plt
from typing import List, Any, cast
from dateutil import parser

from bespoke.inventory.analysis.shared.inventory_types import Query

def get_total_valuation_for_date(
	computed_inventory_packages_dataframe: pandas.DataFrame,
	company_incoming_transfer_packages_dataframe: pandas.DataFrame) -> float:

	in_inventory_computed_inventory_packages_dataframe = computed_inventory_packages_dataframe[computed_inventory_packages_dataframe['is_in_inventory'] == 'true']
		
	print(f'# packages in inventory: {len(in_inventory_computed_inventory_packages_dataframe.index)}')
	
	inventory_with_incoming_transfer_packages_dataframe = in_inventory_computed_inventory_packages_dataframe \
			.astype({'package_id': 'int64'}) \
			.merge(
					company_incoming_transfer_packages_dataframe.astype({'package_id': 'int64'}),
					on='package_id',
					how='inner',
					suffixes=('_l', '_r')
			)

	inventory_with_cost_records = inventory_with_incoming_transfer_packages_dataframe.to_dict('records')

	total_valuation_cost = 0.0

	for inventory_with_cost_record in inventory_with_cost_records:
			incoming_shipped_price = inventory_with_cost_record['receiver_wholesale_price']
			if math.isnan(incoming_shipped_price):
					incoming_shipped_price = 0
			incoming_shipped_quantity = inventory_with_cost_record['received_quantity']
			current_quantity = inventory_with_cost_record['quantity']
			total_valuation_cost += float(current_quantity) * (incoming_shipped_price / incoming_shipped_quantity)

	return total_valuation_cost
			

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
) -> None:

	# Coerce the receipts dataframe by grouping by month, which gets us the total revenue per month
	receipts_dataframe = sales_receipts_dataframe.copy()
	fn = lambda row: f'{row.sales_datetime.year}-{"0" if row.sales_datetime.month < 10 else ""}{row.sales_datetime.month}'
	col = receipts_dataframe.apply(fn, axis=1)
	receipts_dataframe = receipts_dataframe.assign(sales_month=col.values)
	gmv_by_month_dataframe = receipts_dataframe.groupby(['sales_month'])['total_price'].sum()
	specific_gmv_vals = _get_gmv_for_inventory_dates(gmv_by_month_dataframe, q)

	if len(q.inventory_dates) != len(inventory_valuations):
		print('Inventory dates: len {} != inventory_valuations len {}'.format(
			len(q.inventory_dates), len(inventory_valuations)))
		return

	if len(inventory_valuations) != len(specific_gmv_vals):
		print('inventory_valuations: len {} != gmv_by_month len {}'.format(
			len(q.inventory_dates), len(gmv_by_month_dataframe.array)))
		return

	df = pandas.DataFrame({
			'x_values': q.inventory_dates,
			'inventory': inventory_valuations,
			'revenue': specific_gmv_vals,
	})

	# multiple line plots
	plt.figure(figsize=(24, 12))
	plt.plot( 'x_values', 'inventory', data=df, marker='o', markerfacecolor='blue', markersize=12, color='skyblue', linewidth=4)
	plt.plot( 'x_values', 'revenue', data=df, marker='o', color='olive', linewidth=2)

	# show legend
	plt.legend()

	# show graph
	plt.show()
