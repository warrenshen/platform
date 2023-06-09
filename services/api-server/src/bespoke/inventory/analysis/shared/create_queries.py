from typing import Iterable, List, Union, cast
import datetime


def _get_updated_at_where_clause(
    table_name: str, min_updated_at: datetime.datetime
) -> str:
    return (
        f"and {table_name}.updated_at >={min_updated_at.isoformat()}"
        if min_updated_at
        else ""
    )


def _get_identifiers_for_where_clause(
    company_identifier: Union[str, List[str]]
) -> List[str]:
    identifiers = []

    if type(company_identifier) == str:
        identifiers.append(cast(str, company_identifier))
    else:
        identifiers = cast(List[str], company_identifier)

    return ['"{}"'.format(iden) for iden in identifiers]


def create_company_incoming_transfer_packages_query(
    company_identifier: Union[str, List[str]],
    start_date: str,
    end_date: str = None,
    license_numbers: List[str] = None,
    product_name: str = None,
    limit: int = None,
    min_updated_at: datetime.datetime = None,
) -> str:
    # end_date_where_clause
    end_date_where_clause = (
        f"""
		and metrc_transfers.created_date <= "{end_date}"
	"""
        if end_date
        else ""
    )
    # license_numbers_where_clause
    license_numbers = (
        [f"'{license_number}'" for license_number in license_numbers]
        if license_numbers
        else None
    )
    license_numbers_where_clause = (
        f"""
		and company_deliveries.license_number in ({','.join(license_numbers)})
	"""
        if license_numbers
        else ""
    )
    # product_name_where_clause
    product_name_where_clause = (
        f"""
		and metrc_transfer_packages.product_name = "{product_name}"
	"""
        if product_name
        else ""
    )
    # company_identifier_where_clause
    identifiers = _get_identifiers_for_where_clause(company_identifier)
    # limit_clause
    limit_clause = f"LIMIT {limit}" if limit else ""
    # updated_at_where_clause
    updated_at_where_clause = _get_updated_at_where_clause(
        "metrc_transfers", min_updated_at
    )

    return f"""
		select
			case
				when company_deliveries.delivery_type = 'INCOMING_UNKNOWN' then 'INCOMING_FROM_VENDOR'
				when company_deliveries.delivery_type = 'INCOMING_FROM_VENDOR' then 'INCOMING_FROM_VENDOR'
				when company_deliveries.delivery_type = 'OUTGOING_UNKNOWN' then 'OUTGOING_TO_PAYOR'
				when company_deliveries.delivery_type = 'OUTGOING_TO_PAYOR' then 'OUTGOING_TO_PAYOR'
				else company_deliveries.delivery_type
			end as delivery_type,
			company_deliveries.license_number,
			metrc_transfers.manifest_number,
			metrc_transfers.created_date,
			metrc_deliveries.received_datetime,
			metrc_transfers.transfer_payload.shipmenttransactiontype as shipment_transaction_type,
			metrc_transfers.shipper_facility_license_number,
			metrc_transfers.shipper_facility_name,
			metrc_deliveries.recipient_facility_license_number,
			metrc_deliveries.recipient_facility_name,
			metrc_deliveries.shipment_type_name,
			metrc_deliveries.shipment_transaction_type,
			metrc_transfer_packages.package_id,
			metrc_transfer_packages.package_label,
			metrc_transfer_packages.type,
			metrc_transfer_packages.package_payload.sourcepackagelabels as source_package_labels,
			metrc_transfer_packages.package_payload.sourceharvestnames as source_harvest_names,
			metrc_transfer_packages.package_payload.shipmentpackagestate as shipment_package_state,
			metrc_transfer_packages.package_payload.istestingsample as is_testing_sample,
			metrc_transfer_packages.package_payload.istradesample as is_trade_sample,
			metrc_transfer_packages.product_category_name,
			metrc_transfer_packages.product_name,
			metrc_transfer_packages.lab_results_status as package_lab_results_status,
			metrc_transfer_packages.shipper_wholesale_price,
			metrc_transfer_packages.shipped_quantity,
			metrc_transfer_packages.shipped_unit_of_measure,
			metrc_transfer_packages.package_payload.receiverwholesaleprice as receiver_wholesale_price,
			metrc_transfer_packages.received_quantity,
			metrc_transfer_packages.received_unit_of_measure,
			metrc_transfer_packages.package_payload.itemunitweight as item_unit_weight,
			metrc_transfer_packages.package_payload.itemunitweightunitofmeasurename as item_unit_weight_unit_of_measure_name
		from
			metrc_transfers
			inner join company_deliveries on metrc_transfers.id = company_deliveries.transfer_row_id
			inner join companies on company_deliveries.company_id = companies.id
			inner join metrc_deliveries on metrc_transfers.id = metrc_deliveries.transfer_row_id
			inner join metrc_transfer_packages on metrc_deliveries.id = metrc_transfer_packages.delivery_row_id
		where
			True
			and companies.identifier in ({','.join(identifiers)})
			and (
				company_deliveries.delivery_type = 'INCOMING_FROM_VENDOR' or
				company_deliveries.delivery_type = 'INCOMING_INTERNAL' or
				company_deliveries.delivery_type = 'INCOMING_UNKNOWN'
			)
			and metrc_transfers.created_date >= "{start_date}"
			{end_date_where_clause}
			{license_numbers_where_clause}
			{product_name_where_clause}
			{updated_at_where_clause}
		order by
			created_date desc
		{limit_clause}
	"""


def create_company_outgoing_transfer_packages_query(
    company_identifier: Union[str, List[str]],
    start_date: str,
    end_date: str = None,
    license_numbers: List[str] = None,
    product_name: str = None,
    limit: int = None,
    min_updated_at: datetime.datetime = None,
) -> str:
    end_date_where_clause = (
        f"""
		and metrc_transfers.created_date <= "{end_date}"
	"""
        if end_date
        else ""
    )
    license_numbers = (
        [f"'{license_number}'" for license_number in license_numbers]
        if license_numbers
        else None
    )
    license_numbers_where_clause = (
        f"""
		and company_deliveries.license_number in ({','.join(license_numbers)})
	"""
        if license_numbers
        else ""
    )
    product_name_where_clause = (
        f"""
		and metrc_transfer_packages.product_name = "{product_name}"
	"""
        if product_name
        else ""
    )
    # company_identifier_where_clause
    identifiers = _get_identifiers_for_where_clause(company_identifier)
    limit_clause = f"LIMIT {limit}" if limit else ""
    updated_at_where_clause = _get_updated_at_where_clause(
        "metrc_transfers", min_updated_at
    )

    return f"""
		select
			case
				when company_deliveries.delivery_type = 'INCOMING_FROM_VENDOR' then 'INCOMING_FROM_VENDOR'
				when company_deliveries.delivery_type = 'INCOMING_UNKNOWN' then 'INCOMING_FROM_VENDOR'
				when company_deliveries.delivery_type = 'OUTGOING_UNKNOWN' then 'OUTGOING_TO_PAYOR'
				when company_deliveries.delivery_type = 'OUTGOING_TO_PAYOR' then 'OUTGOING_TO_PAYOR'
				else company_deliveries.delivery_type
			end as delivery_type,
			company_deliveries.license_number,
			metrc_transfers.manifest_number,
			metrc_transfers.created_date,
			metrc_deliveries.received_datetime,
			metrc_transfers.shipper_facility_license_number,
			metrc_transfers.shipper_facility_name,
			metrc_deliveries.recipient_facility_license_number,
			metrc_deliveries.recipient_facility_name,
			metrc_deliveries.shipment_type_name,
			metrc_deliveries.shipment_transaction_type,
			metrc_transfer_packages.package_id,
			metrc_transfer_packages.package_label,
			metrc_transfer_packages.type,
			metrc_transfer_packages.package_payload.sourcepackagelabels as source_package_labels,
			metrc_transfer_packages.package_payload.sourceharvestnames as source_harvest_names,
			metrc_transfer_packages.package_payload.shipmentpackagestate as shipment_package_state,
			metrc_transfer_packages.package_payload.istestingsample as is_testing_sample,
			metrc_transfer_packages.package_payload.istradesample as is_trade_sample,
			metrc_transfer_packages.product_category_name,
			metrc_transfer_packages.product_name,
			metrc_transfer_packages.lab_results_status as package_lab_results_status,
			metrc_transfer_packages.shipper_wholesale_price,
			metrc_transfer_packages.shipped_quantity,
			metrc_transfer_packages.shipped_unit_of_measure,
			metrc_transfer_packages.received_quantity,
			metrc_transfer_packages.received_unit_of_measure,
			metrc_transfer_packages.package_payload.receiverwholesaleprice as receiver_wholesale_price,
			metrc_transfer_packages.package_payload.itemunitweight as item_unit_weight,
			metrc_transfer_packages.package_payload.itemunitweightunitofmeasurename as item_unit_weight_unit_of_measure_name
		from
			metrc_transfers
			inner join company_deliveries on metrc_transfers.id = company_deliveries.transfer_row_id
			inner join companies on company_deliveries.company_id = companies.id
			inner join metrc_deliveries on metrc_transfers.id = metrc_deliveries.transfer_row_id
			inner join metrc_transfer_packages on metrc_deliveries.id = metrc_transfer_packages.delivery_row_id
		where
			True
			and companies.identifier in ({','.join(identifiers)})
			and (
				company_deliveries.delivery_type = 'OUTGOING_TO_PAYOR' or
				company_deliveries.delivery_type = 'OUTGOING_INTERNAL' or
				company_deliveries.delivery_type = 'OUTGOING_UNKNOWN'
			)
			and metrc_transfers.created_date >= "{start_date}"
			{end_date_where_clause}
			{license_numbers_where_clause}
			{product_name_where_clause}
			{updated_at_where_clause}
		order by
			metrc_transfers.created_date desc
		{limit_clause}
	"""


def create_company_unknown_transfer_packages_query(
    company_identifier: Union[str, List[str]],
    start_date: str,
) -> str:
    # company_identifier_where_clause
    identifiers = _get_identifiers_for_where_clause(company_identifier)
    return f"""
		select
			case
				when company_deliveries.delivery_type = 'INCOMING_FROM_VENDOR' then 'INCOMING_FROM_VENDOR'
				when company_deliveries.delivery_type = 'INCOMING_UNKNOWN' then 'INCOMING_FROM_VENDOR'
				when company_deliveries.delivery_type = 'OUTGOING_UNKNOWN' then 'OUTGOING_TO_PAYOR'
				when company_deliveries.delivery_type = 'OUTGOING_TO_PAYOR' then 'OUTGOING_TO_PAYOR'
				else company_deliveries.delivery_type
			end as delivery_type,
			company_deliveries.license_number,
			metrc_transfers.manifest_number,
			metrc_transfers.created_date,
			metrc_deliveries.received_datetime,
			metrc_transfers.shipper_facility_license_number,
			metrc_transfers.shipper_facility_name,
			metrc_deliveries.recipient_facility_license_number,
			metrc_deliveries.recipient_facility_name,
			metrc_deliveries.shipment_type_name,
			metrc_deliveries.shipment_transaction_type,
			metrc_transfer_packages.package_id,
			metrc_transfer_packages.package_label,
			metrc_transfer_packages.type,
			metrc_transfer_packages.package_payload.shipmentpackagestate as shipment_package_state,
			metrc_transfer_packages.package_payload.istestingsample as is_testing_sample,
			metrc_transfer_packages.package_payload.istradesample as is_trade_sample,
			metrc_transfer_packages.product_category_name,
			metrc_transfer_packages.product_name,
			metrc_transfer_packages.lab_results_status as package_lab_results_status,
			metrc_transfer_packages.shipper_wholesale_price,
			metrc_transfer_packages.shipped_quantity,
			metrc_transfer_packages.shipped_unit_of_measure,
			metrc_transfer_packages.received_quantity,
			metrc_transfer_packages.received_unit_of_measure,
			metrc_transfer_packages.package_payload.itemunitweight as item_unit_weight,
			metrc_transfer_packages.package_payload.itemunitweightunitofmeasurename as item_unit_weight_unit_of_measure_name
		from
			metrc_transfers
			inner join company_deliveries on metrc_transfers.id = company_deliveries.transfer_row_id
			inner join companies on company_deliveries.company_id = companies.id
			inner join metrc_deliveries on metrc_transfers.id = metrc_deliveries.transfer_row_id
			inner join metrc_transfer_packages on metrc_deliveries.id = metrc_transfer_packages.delivery_row_id
		where
			True
			and companies.identifier in ({','.join(identifiers)})
			and (
				company_deliveries.delivery_type = 'UNKNOWN'
			)
			and metrc_transfers.created_date >= "{start_date}"
		order by
			metrc_transfers.created_date desc
	"""


def create_company_sales_receipts_query(
    company_identifier: Union[str, List[str]],
    start_date: str,
    license_numbers: List[str] = None,
    limit: int = None,
    min_updated_at: datetime.datetime = None,
) -> str:

    license_numbers = (
        [f"'{license_number}'" for license_number in license_numbers]
        if license_numbers
        else None
    )
    license_numbers_where_clause = (
        f"""
		and metrc_sales_receipts.license_number in ({','.join(license_numbers)})
	"""
        if license_numbers
        else ""
    )
    # company_identifier_where_clause
    identifiers = _get_identifiers_for_where_clause(company_identifier)
    limit_clause = f"LIMIT {limit}" if limit else ""
    updated_at_where_clause = _get_updated_at_where_clause(
        "metrc_sales_receipts", min_updated_at
    )

    return f"""
		select
			metrc_sales_receipts.license_number,
			metrc_sales_receipts.receipt_id,
			metrc_sales_receipts.receipt_number,
			metrc_sales_receipts.type,
			metrc_sales_receipts.sales_customer_type,
			metrc_sales_receipts.sales_datetime,
			metrc_sales_receipts.total_packages,
			metrc_sales_receipts.total_price
		from
			metrc_sales_receipts
			inner join companies on metrc_sales_receipts.company_id = companies.id
		where
			True
			and companies.identifier in ({','.join(identifiers)})
			and metrc_sales_receipts.sales_datetime >= "{start_date}"
			{license_numbers_where_clause}
			{updated_at_where_clause}
		order by
			metrc_sales_receipts.sales_datetime desc
		{limit_clause}
	"""


def create_company_sales_receipts_with_transactions_query(
    company_identifier: Union[str, List[str]],
    start_date: str,
    unit_of_measure: str = None,
    license_numbers: List[str] = None,
    limit: int = None,
) -> str:
    """
    Note the left outer join of metrc_sales_transactions.
    """
    if unit_of_measure and unit_of_measure not in ["Each"]:
        print("[ERROR] Given unit of measure is not valid")
        return None
    unit_of_measure_where_clause = (
        f"""
		and metrc_sales_transactions.unit_of_measure = "{unit_of_measure}"
	"""
        if unit_of_measure
        else ""
    )

    license_numbers = (
        [f"'{license_number}'" for license_number in license_numbers]
        if license_numbers
        else None
    )
    license_numbers_where_clause = (
        f"""
		and metrc_sales_receipts.license_number in ({','.join(license_numbers)})
	"""
        if license_numbers
        else ""
    )
    # company_identifier_where_clause
    identifiers = _get_identifiers_for_where_clause(company_identifier)
    limit_clause = f"LIMIT {limit}" if limit else ""

    return f"""
		select
			metrc_sales_receipts.license_number,
			metrc_sales_receipts.receipt_number,
			metrc_sales_receipts.type as rt_type,
			metrc_sales_receipts.sales_customer_type,
			metrc_sales_receipts.sales_datetime,
			date_trunc(metrc_sales_receipts.sales_datetime, month) as sales_month,
			metrc_sales_receipts.total_packages,
			metrc_sales_receipts.total_price as rt_total_price,
			metrc_sales_transactions.type as tx_type,
			metrc_sales_transactions.package_id as tx_package_id,
			metrc_sales_transactions.package_label as tx_package_label,
			metrc_sales_transactions.product_name as tx_product_name,
			metrc_sales_transactions.product_category_name as tx_product_category_name,
			metrc_sales_transactions.unit_of_measure as tx_unit_of_measure,
			metrc_sales_transactions.quantity_sold as tx_quantity_sold,
			metrc_sales_transactions.total_price as tx_total_price
		from
			metrc_sales_receipts
			inner join companies on metrc_sales_receipts.company_id = companies.id
			left outer join metrc_sales_transactions on metrc_sales_receipts.id = metrc_sales_transactions.receipt_row_id
		where
			True
			and companies.identifier in ({','.join(identifiers)})
			and metrc_sales_receipts.sales_datetime >= "{start_date}"
			{unit_of_measure_where_clause}
			{license_numbers_where_clause}
		order by
			metrc_sales_receipts.sales_datetime desc
		{limit_clause}
	"""


def create_company_sales_transactions_query(
    company_identifier: Union[str, List[str]],
    start_date: str,
    license_numbers: List[str] = None,
    limit: int = None,
    min_updated_at: datetime.datetime = None,
) -> str:

    license_numbers = (
        [f"'{license_number}'" for license_number in license_numbers]
        if license_numbers
        else None
    )
    license_numbers_where_clause = (
        f"""
		and metrc_sales_receipts.license_number in ({','.join(license_numbers)})
	"""
        if license_numbers
        else ""
    )
    # company_identifier_where_clause
    identifiers = _get_identifiers_for_where_clause(company_identifier)
    limit_clause = f"LIMIT {limit}" if limit else ""
    updated_at_where_clause = _get_updated_at_where_clause(
        "metrc_sales_receipts", min_updated_at
    )

    return f"""
		select
			metrc_sales_receipts.license_number,
			metrc_sales_receipts.receipt_number,
			metrc_sales_receipts.type as rt_type,
			metrc_sales_receipts.sales_customer_type,
			metrc_sales_receipts.sales_datetime,
			metrc_sales_receipts.total_packages,
			metrc_sales_receipts.total_price as rt_total_price,
			metrc_sales_transactions.type as tx_type,
			metrc_sales_transactions.package_id as package_id,
			metrc_sales_transactions.package_id as tx_package_id,
			metrc_sales_transactions.package_label as tx_package_label,
			metrc_sales_transactions.product_name as tx_product_name,
			metrc_sales_transactions.product_category_name as tx_product_category_name,
			metrc_sales_transactions.unit_of_measure as tx_unit_of_measure,
			metrc_sales_transactions.quantity_sold as tx_quantity_sold,
			metrc_sales_transactions.total_price as tx_total_price,
			metrc_sales_transactions.is_deleted as tx_is_deleted
		from
			metrc_sales_receipts
			inner join companies on metrc_sales_receipts.company_id = companies.id
			inner join metrc_sales_transactions on metrc_sales_receipts.id = metrc_sales_transactions.receipt_row_id
		where
			True
			and companies.identifier in ({','.join(identifiers)})
			and metrc_sales_receipts.sales_datetime >= "{start_date}"
			{license_numbers_where_clause}
			{updated_at_where_clause}
		order by
			metrc_sales_receipts.sales_datetime desc
		{limit_clause}
	"""


def create_company_inventory_packages_query(
    company_identifier: Union[str, List[str]],
    include_quantity_zero: bool = False,
    license_numbers: List[str] = None,
    product_name: str = None,
    limit: int = None,
    min_updated_at: datetime.datetime = None,
) -> str:
    include_quantity_zero_where_clause = (
        "" if include_quantity_zero else "and metrc_packages.quantity > 0"
    )
    license_numbers = (
        [f"'{license_number}'" for license_number in license_numbers]
        if license_numbers
        else None
    )
    license_numbers_where_clause = (
        f"""
		and metrc_packages.license_number in ({','.join(license_numbers)})
	"""
        if license_numbers
        else ""
    )
    product_name_where_clause = (
        f"""
		and metrc_packages.product_name = "{product_name}"
	"""
        if product_name
        else ""
    )
    # company_identifier_where_clause
    identifiers = _get_identifiers_for_where_clause(company_identifier)
    limit_clause = f"LIMIT {limit}" if limit else ""
    updated_at_where_clause = _get_updated_at_where_clause(
        "metrc_packages", min_updated_at
    )

    return f"""
		select
			metrc_packages.license_number,
			metrc_packages.package_id,
			metrc_packages.package_label,
			metrc_packages.type,
			metrc_packages.packaged_date,
			metrc_packages.last_modified_at,
			metrc_packages.package_type,
			metrc_packages.product_name,
			metrc_packages.product_category_name,
			metrc_packages.quantity,
			metrc_packages.unit_of_measure,
			metrc_packages.package_payload.itemid as item_id,
			metrc_packages.package_payload.itemproductcategorytype as item_product_category_type,
			metrc_packages.package_payload.productionbatchnumber as production_batch_number,
			metrc_packages.package_payload.sourceproductionbatchnumbers as source_production_batch_numbers,
			metrc_packages.package_payload.sourceharvestnames as source_harvest_names,
			metrc_packages.package_payload.istestingsample as is_testing_sample,
			metrc_packages.package_payload.istradesample as is_trade_sample,
			metrc_packages.package_payload.isonhold as is_on_hold,
			metrc_packages.package_payload.archiveddate as archived_date,
			metrc_packages.package_payload.finisheddate as finished_date
		from
			companies
			inner join metrc_packages on companies.id = metrc_packages.company_id
		where
			True
			and companies.identifier in ({','.join(identifiers)})
			and (
				metrc_packages.type = 'active' or
				metrc_packages.type = 'onhold'
			)
			{include_quantity_zero_where_clause}
			{license_numbers_where_clause}
			{product_name_where_clause}
			{updated_at_where_clause}
		order by
			metrc_packages.packaged_date desc
		{limit_clause}
	"""


def create_company_all_packages_query(
    company_identifier: Union[str, List[str]],
    license_numbers: List[str] = None,
    limit: int = None,
) -> str:
    license_numbers = (
        [f"'{license_number}'" for license_number in license_numbers]
        if license_numbers
        else None
    )
    license_numbers_where_clause = (
        f"""
		and metrc_packages.license_number in ({','.join(license_numbers)})
	"""
        if license_numbers
        else ""
    )
    # company_identifier_where_clause
    identifiers = _get_identifiers_for_where_clause(company_identifier)
    limit_clause = f"LIMIT {limit}" if limit else ""

    return f"""
		select
			metrc_packages.license_number,
			metrc_packages.package_id,
			metrc_packages.package_label,
			metrc_packages.type,
			metrc_packages.packaged_date,
			metrc_packages.last_modified_at,
			metrc_packages.package_type,
			metrc_packages.product_name,
			metrc_packages.product_category_name,
			metrc_packages.quantity,
			metrc_packages.unit_of_measure,
			metrc_packages.package_payload.itemid as item_id,
			metrc_packages.package_payload.itemproductcategorytype as item_product_category_type,
			metrc_packages.package_payload.productionbatchnumber as production_batch_number,
			metrc_packages.package_payload.sourceproductionbatchnumbers as source_production_batch_numbers,
			metrc_packages.package_payload.sourceharvestnames as source_harvest_names,
			metrc_packages.package_payload.istestingsample as is_testing_sample,
			metrc_packages.package_payload.istradesample as is_trade_sample,
			metrc_packages.package_payload.isonhold as is_on_hold,
			metrc_packages.package_payload.archiveddate as archived_date,
			metrc_packages.package_payload.finisheddate as finished_date
		from
			companies
			inner join metrc_packages on companies.id = metrc_packages.company_id
		where
			True
			and companies.identifier in ({','.join(identifiers)})
			{license_numbers_where_clause}
		order by
			metrc_packages.packaged_date desc
		{limit_clause}
	"""


def create_company_sales_transactions_by_product_name(
    product_name: str, company_identifier: Union[str, List[str]]
) -> str:
    # company_identifier_where_clause
    identifiers = _get_identifiers_for_where_clause(company_identifier)
    return f"""
		select
			companies.identifier,
			metrc_sales_receipts.license_number,
			metrc_sales_receipts.sales_datetime,
			metrc_sales_transactions.package_id,
			metrc_sales_transactions.product_category_name,
			metrc_sales_transactions.product_name,
			metrc_sales_transactions.quantity_sold,
			metrc_sales_transactions.total_price
		from
			metrc_sales_transactions
			left outer join metrc_sales_receipts on metrc_sales_transactions.receipt_row_id = metrc_sales_receipts.id
			left outer join companies on metrc_sales_receipts.company_id = companies.id
		where
			True
			and companies.identifier in ({','.join(identifiers)})
			and metrc_sales_transactions.product_name = "{product_name}"
		order by
			metrc_sales_receipts.sales_datetime desc
	"""


# ID queries: get data by IDs.
def create_sales_transactions_by_package_id_query(package_id: str) -> str:
    return f"""
		select
			companies.identifier,
			metrc_sales_receipts.license_number,
			metrc_sales_receipts.sales_datetime,
			metrc_sales_transactions.package_id,
			metrc_sales_transactions.product_category_name,
			metrc_sales_transactions.product_name,
			metrc_sales_transactions.total_price
		from
			metrc_sales_transactions
			left outer join metrc_sales_receipts on metrc_sales_transactions.receipt_row_id = metrc_sales_receipts.id
			left outer join companies on metrc_sales_receipts.company_id = companies.id
		where
			True
			and metrc_sales_transactions.package_id = "{package_id}"
	"""


def create_transfer_packages_by_package_id_query(package_id: str) -> str:
    return f"""
		select
			companies.identifier,
			company_deliveries.delivery_type,
			company_deliveries.updated_at,
			metrc_transfers.manifest_number,
			metrc_transfers.shipper_facility_name,
			metrc_transfers.shipper_facility_license_number,
			metrc_deliveries.recipient_facility_name,
			metrc_deliveries.recipient_facility_license_number,
			metrc_deliveries.received_datetime,
			metrc_transfer_packages.package_id,
			metrc_transfer_packages.package_label,
			metrc_transfer_packages.package_payload.packagetype,
			metrc_transfer_packages.product_category_name,
			metrc_transfer_packages.product_name,
			metrc_transfer_packages.shipped_quantity,
			metrc_transfer_packages.shipper_wholesale_price,
			metrc_transfer_packages.received_quantity,
			metrc_transfer_packages.*
		from
			metrc_transfer_packages
			left outer join metrc_deliveries on metrc_transfer_packages.delivery_row_id = metrc_deliveries.id
			left outer join metrc_transfers on metrc_deliveries.transfer_row_id = metrc_transfers.id
			left outer join company_deliveries on metrc_transfers.id = company_deliveries.transfer_row_id
			left outer join companies on company_deliveries.company_id = companies.id
		where
			True
			and metrc_transfer_packages.package_id = "{package_id}"
	"""


def create_packages_by_package_id_query(package_id: str) -> str:
    return f"""
		select
			companies.identifier,
			metrc_packages.license_number,
			metrc_packages.type,
			metrc_packages.package_type,
			metrc_packages.product_category_name,
			metrc_packages.product_name,
			metrc_packages.package_id,
			metrc_packages.package_label,
			metrc_packages.quantity,
			metrc_packages.unit_of_measure,
			metrc_packages.*
		from
			metrc_packages
			left outer join companies on metrc_packages.company_id = companies.id
		where
			True
			and metrc_packages.package_id = "{package_id}"
	"""


# Other identifier queries: get data by non-ID identifiers.
def create_packages_by_production_batch_number_query(
    production_batch_number: str,
) -> str:
    if not production_batch_number:
        print("[ERROR] Given production batch number is not valid")
        return None
    return f"""
		select
			companies.identifier,
			metrc_packages.license_number,
			metrc_packages.type,
			metrc_packages.package_type,
			metrc_packages.product_category_name,
			metrc_packages.product_name,
			metrc_packages.package_id,
			metrc_packages.package_label,
			metrc_packages.quantity,
			metrc_packages.unit_of_measure,
			metrc_packages.*
		from
			metrc_packages
			left outer join companies on metrc_packages.company_id = companies.id
		where
			True
			and metrc_packages.package_payload.productionbatchnumber = "{production_batch_number}"
	"""


def create_packages_by_source_production_batch_number_query(
    source_production_batch_number: str,
) -> str:
    return f"""
		select
			companies.identifier,
			metrc_packages.license_number,
			metrc_packages.type,
			metrc_packages.package_type,
			metrc_packages.product_category_name,
			metrc_packages.product_name,
			metrc_packages.package_id,
			metrc_packages.package_label,
			metrc_packages.quantity,
			metrc_packages.unit_of_measure,
			metrc_packages.*
		from
			metrc_packages
			left outer join companies on metrc_packages.company_id = companies.id
		where
			True
			and metrc_packages.package_payload.sourceproductionbatchnumbers like "%{source_production_batch_number}%"
	"""


def create_packages_by_source_harvest_name_query(source_harvest_name: str) -> str:
    return f"""
		select
			companies.identifier,
			metrc_packages.license_number,
			metrc_packages.type,
			metrc_packages.package_type,
			metrc_packages.product_category_name,
			metrc_packages.product_name,
			metrc_packages.package_id,
			metrc_packages.package_label,
			metrc_packages.quantity,
			metrc_packages.unit_of_measure,
			metrc_packages.*
		from
			metrc_packages
			left outer join companies on metrc_packages.company_id = companies.id
		where
			True
			and metrc_packages.package_payload.sourceharvestnames like "%{source_harvest_name}%"
	"""


def create_packages_by_product_name_query(product_name: str) -> str:
    return f"""
		select
			companies.identifier,
			metrc_packages.license_number,
			metrc_packages.type,
			metrc_packages.package_type,
			metrc_packages.product_category_name,
			metrc_packages.product_name,
			metrc_packages.package_id,
			metrc_packages.package_label,
			metrc_packages.quantity,
			metrc_packages.unit_of_measure,
			metrc_packages.*
		from
			metrc_packages
			left outer join companies on metrc_packages.company_id = companies.id
		where
			True
			and metrc_packages.product_name like "%{product_name}%"
	"""


def create_packages_by_package_label_query(package_label: str) -> str:
    return f"""
		select
			companies.identifier,
			metrc_packages.license_number,
			metrc_packages.type,
			metrc_packages.package_type,
			metrc_packages.product_category_name,
			metrc_packages.product_name,
			metrc_packages.package_id,
			metrc_packages.package_label,
			metrc_packages.quantity,
			metrc_packages.unit_of_measure,
			metrc_packages.*
		from
			metrc_packages
			left outer join companies on metrc_packages.company_id = companies.id
		where
			True
			and metrc_packages.package_label = "{package_label}"
	"""


def create_transfer_packages_by_source_harvest_name_query(
    source_harvest_name: str,
) -> str:
    return f"""
		select
			case
				when company_deliveries.delivery_type = 'INCOMING_UNKNOWN' then 'INCOMING_FROM_VENDOR'
				when company_deliveries.delivery_type = 'INCOMING_FROM_VENDOR' then 'INCOMING_FROM_VENDOR'
				when company_deliveries.delivery_type = 'OUTGOING_UNKNOWN' then 'OUTGOING_TO_PAYOR'
				when company_deliveries.delivery_type = 'OUTGOING_TO_PAYOR' then 'OUTGOING_TO_PAYOR'
				else company_deliveries.delivery_type
			end as delivery_type,
			company_deliveries.license_number,
			metrc_transfers.manifest_number,
			metrc_transfers.created_date,
			metrc_deliveries.received_datetime,
			metrc_transfers.shipper_facility_license_number,
			metrc_transfers.shipper_facility_name,
			metrc_deliveries.recipient_facility_license_number,
			metrc_deliveries.recipient_facility_name,
			metrc_deliveries.shipment_type_name,
			metrc_deliveries.shipment_transaction_type,
			metrc_transfer_packages.package_id,
			metrc_transfer_packages.package_label,
			metrc_transfer_packages.type,
			metrc_transfer_packages.package_payload.sourcepackagelabels as source_package_labels,
			metrc_transfer_packages.package_payload.sourceharvestnames as source_harvest_names,
			metrc_transfer_packages.package_payload.shipmentpackagestate as shipment_package_state,
			metrc_transfer_packages.package_payload.istestingsample as is_testing_sample,
			metrc_transfer_packages.package_payload.istradesample as is_trade_sample,
			metrc_transfer_packages.product_category_name,
			metrc_transfer_packages.product_name,
			metrc_transfer_packages.lab_results_status as package_lab_results_status,
			metrc_transfer_packages.shipper_wholesale_price,
			metrc_transfer_packages.shipped_quantity,
			metrc_transfer_packages.shipped_unit_of_measure,
			metrc_transfer_packages.received_quantity,
			metrc_transfer_packages.received_unit_of_measure,
			metrc_transfer_packages.package_payload.itemunitweight as item_unit_weight,
			metrc_transfer_packages.package_payload.itemunitweightunitofmeasurename as item_unit_weight_unit_of_measure_name
		from
			metrc_transfers
			inner join company_deliveries on metrc_transfers.id = company_deliveries.transfer_row_id
			inner join companies on company_deliveries.company_id = companies.id
			inner join metrc_deliveries on metrc_transfers.id = metrc_deliveries.transfer_row_id
			inner join metrc_transfer_packages on metrc_deliveries.id = metrc_transfer_packages.delivery_row_id
		where
			True
			and metrc_transfer_packages.package_payload.sourceharvestnames like "%{source_harvest_name}%"
		order by
			created_date desc
	"""


def are_packages_inactive_query(package_ids: Iterable[str]) -> str:
    package_ids_str = ",".join([f"'{package_id}'" for package_id in list(package_ids)])

    return f"""
		select
			companies.identifier,
			metrc_packages.license_number,
			metrc_packages.type,
			metrc_packages.package_id,
			metrc_packages.package_label,
			metrc_packages.packaged_date,
			metrc_packages.product_category_name,
			metrc_packages.product_name,
			metrc_packages.quantity,
			metrc_packages.unit_of_measure,
			metrc_packages.package_payload.itemid as item_id,
			metrc_packages.package_payload.itemproductcategorytype as item_product_category_type,
			metrc_packages.package_payload.productionbatchnumber as production_batch_number,
			metrc_packages.package_payload.sourceproductionbatchnumbers as source_production_batch_numbers,
			metrc_packages.package_payload.sourceharvestnames as source_harvest_names,
			metrc_packages.package_payload.istestingsample as is_testing_sample,
			metrc_packages.package_payload.istradesample as is_trade_sample,
			metrc_packages.package_payload.archiveddate as archived_date,
			metrc_packages.package_payload.finisheddate as finished_date
		from
			metrc_packages
			inner join companies on metrc_packages.company_id = companies.id
		where
			True
			and metrc_packages.package_id in ({package_ids_str})
			and metrc_packages.type = 'inactive'
	"""


def create_packages_by_package_ids_query(package_ids: Iterable[str]) -> str:
    package_ids_str = ",".join([f"'{package_id}'" for package_id in list(package_ids)])

    return f"""
		select
			companies.identifier,
			metrc_packages.license_number,
			metrc_packages.type,
			metrc_packages.package_type,
			metrc_packages.product_category_name,
			metrc_packages.product_name,
			metrc_packages.package_id,
			metrc_packages.package_label,
			metrc_packages.quantity,
			metrc_packages.unit_of_measure,
			metrc_packages.package_payload.itemid as item_id,
			metrc_packages.package_payload.itemproductcategorytype as item_product_category_type,
			metrc_packages.package_payload.productionbatchnumber as production_batch_number,
			metrc_packages.package_payload.sourceproductionbatchnumbers as source_production_batch_numbers,
			metrc_packages.package_payload.sourceharvestnames as source_harvest_names,
			metrc_packages.package_payload.istestingsample as is_testing_sample,
			metrc_packages.package_payload.istradesample as is_trade_sample,
			metrc_packages.package_payload.archiveddate as archived_date,
			metrc_packages.package_payload.finisheddate as finished_date   
		from
			metrc_packages
			left outer join companies on metrc_packages.company_id = companies.id
		where
			True
			and metrc_packages.package_id in ({package_ids_str})
	"""


def create_packages_by_production_batch_numbers_query(
    production_batch_numbers: Iterable[str],
) -> str:
    production_batch_numbers_str = ",".join(
        [
            "'{}'".format(num.replace("'", "\\'"))
            for num in list(production_batch_numbers)
        ]
    )

    return f"""
		select
			companies.identifier,
			metrc_packages.license_number,
			metrc_packages.type,
			metrc_packages.package_type,
			metrc_packages.product_category_name,
			metrc_packages.product_name,
			metrc_packages.package_id,
			metrc_packages.package_label,
			metrc_packages.quantity,
			metrc_packages.unit_of_measure,
			metrc_packages.package_payload.itemid as item_id,
			metrc_packages.package_payload.itemproductcategorytype as item_product_category_type,
			metrc_packages.package_payload.productionbatchnumber as production_batch_number,
			metrc_packages.package_payload.sourceproductionbatchnumbers as source_production_batch_numbers,
			metrc_packages.package_payload.sourceharvestnames as source_harvest_names,
			metrc_packages.package_payload.istestingsample as is_testing_sample,
			metrc_packages.package_payload.istradesample as is_trade_sample,
			metrc_packages.package_payload.archiveddate as archived_date,
			metrc_packages.package_payload.finisheddate as finished_date
		from
			metrc_packages
			left outer join companies on metrc_packages.company_id = companies.id
		where
			True
			and metrc_packages.package_payload.productionbatchnumber in ({production_batch_numbers_str})
	"""


####### For licenses


def create_company_download_summaries_query(
    company_identifier: Union[List[str], str],
    start_date: str,
    end_date: str = None,
) -> str:
    identifiers = _get_identifiers_for_where_clause(company_identifier)

    end_date_where_clause = (
        f"""
		and metrc_download_summaries.date <= "{end_date}"
	"""
        if end_date
        else ""
    )
    return f"""
		select
			companies.id as company_id,
			companies.identifier as company_identifier,
			metrc_download_summaries.license_number,
			metrc_download_summaries.date,
			metrc_download_summaries.status
		from
			metrc_download_summaries
			inner join companies on metrc_download_summaries.company_id = companies.id
		where
			True
			and companies.identifier in ({','.join(identifiers)})
			and metrc_download_summaries.date >= "{start_date}"
			{end_date_where_clause}
		order by
			date desc
	"""


def create_metrc_download_summary_companies_query() -> str:
    return f"""
				select
						distinct
						companies.name,
						companies.identifier,
						companies.id
				from
						companies
						inner join metrc_download_summaries on companies.id = metrc_download_summaries.company_id
				where
						True
				group by
						1,
						2,
						3
				order by
						1,
						2
		"""


# Company queries: get data for a specific-company.
def create_company_licenses_query(company_identifier: Union[str, List[str]]) -> str:
    identifiers = _get_identifiers_for_where_clause(company_identifier)

    return f"""
			select
					company_licenses.us_state,
					company_licenses.license_number,
					company_licenses.license_category,
					company_licenses.legal_name,
					company_licenses.is_current,
					company_licenses.license_status,
					company_licenses.rollup_id,
					company_licenses.license_description,
					company_licenses.company_id,
					company_licenses.facility_row_id
			from
					company_licenses
					inner join companies on company_licenses.company_id = companies.id
			where
					True
					and companies.identifier in ({','.join(identifiers)})
	"""


def create_company_repayment_history_query(
    company_identifier: Union[str, List[str]]
) -> str:
    identifiers = _get_identifiers_for_where_clause(company_identifier)

    return f"""with company_loan as 
(
   select
      companies.id company_id,
      companies.identifier,
      company_licenses.license_number,
      loans.id loan_id,
      loans.amount loan_amount,
      loans.adjusted_maturity_date,
      loans.outstanding_principal_balance,
      loans.outstanding_interest,
      loans.outstanding_fees 
   from
      companies  
      inner join
         company_licenses 
         on companies.id = company_licenses.company_id 
      inner join
         loans  
         on companies.id = loans.company_id 
   where adjusted_maturity_date is not null
)
,
loan_repayment as 
(
   select
      payments.amount,
      payments.company_id,
      payments.settlement_date,
      transactions.loan_id,
      transactions.to_principal,
      transactions.to_interest,
      transactions.to_fees 
   from
      payments as payments 
      inner join
         transactions as transactions 
         on payments.id = transactions.payment_id 
   where
      (
         payments.type = 'repayment' 
         or payments.type = 'repayment_of_account_fee' 
      )
)
,
company_loan_repayment as 
(
   select
      company_loan.*,
      loan_repayment.amount,
      loan_repayment.settlement_date,
      loan_repayment.to_fees,
      loan_repayment.to_interest,
      loan_repayment.to_principal 
   from
      company_loan 
      left join
         loan_repayment 
         on company_loan.company_id = loan_repayment.company_id 
         and company_loan.loan_id = loan_repayment.loan_id 
)
,
repayment_data as 
(
   select
      company_id,
      identifier,
      loan_id,
      loan_amount,
      outstanding_principal_balance,
      adjusted_maturity_date,
      max(settlement_date) last_settlement_date,
      sum(to_principal) total_paid 
   from
      company_loan_repayment 
   group by
      1,
      2,
      3,
      4,
      5,
      6
)
,
repayment_data_with_dpd as 
(
   select
      *,
      case
         when
            outstanding_principal_balance = 0 
         then
            DATE_DIFF(last_settlement_date, adjusted_maturity_date, DAY) 
         else
            DATE_DIFF(CURRENT_DATE(), adjusted_maturity_date, DAY) 
      end
      as days_late_temp 
   from
      repayment_data 
)
select
   *,
   case
      when
         days_late_temp < 0 
      then
         0 
      else
         days_late_temp 
   end
   as days_late 
from
   repayment_data_with_dpd 
where
   True
   and identifier in ({','.join(identifiers)})
"""


def create_company_facilities_query(company_ids: List[str]) -> str:
    company_ids_list = ['"{}"'.format(iden) for iden in company_ids]

    return f"""
			select
					company_facilities.id as facility_row_id,
					company_facilities.name as facility_name
			from
					company_facilities
			where
					True
					and company_facilities.company_id in ({','.join(company_ids_list)})
	"""


def create_company_count_metrc_sales_receipts_query(
    company_identifier: Union[str, List[str]]
) -> str:
    identifiers = _get_identifiers_for_where_clause(company_identifier)

    return f"""
			select
					companies.name,
					companies.identifier,
					count(metrc_sales_receipts.receipt_id) as count
			from
					companies
					inner join metrc_sales_receipts on companies.id = metrc_sales_receipts.company_id
			where
					True
					and companies.identifier in ({','.join(identifiers)})
			group by
					1,
					2
	"""


def create_not_completed_metrc_download_summaries_query() -> str:
    return f"""
		select
			metrc_download_summaries.id,
			companies.name as company_name,
			companies.identifier as company_identifier,
			metrc_download_summaries.date,
			metrc_download_summaries.status,
			metrc_download_summaries.license_number,
		from
			metrc_download_summaries
			inner join companies on metrc_download_summaries.company_id = companies.id
		where
			True
			and metrc_download_summaries.status != 'completed'
		order by
			3
	"""
