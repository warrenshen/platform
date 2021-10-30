# Company queries: get data for a specific-company.
def create_company_licenses_query(company_identifier):
    return f"""
        select
            company_licenses.us_state,
            company_licenses.license_number,
            company_licenses.license_category,
            company_licenses.legal_name,
            company_licenses.is_current,
            company_licenses.license_status,
            company_licenses.rollup_id,
            company_licenses.license_description
        from
            company_licenses
            inner join companies on company_licenses.company_id = companies.id
        where
            True
            and companies.identifier = '{company_identifier}'
    """

def create_company_download_summaries_query(company_identifier, start_date, end_date=None):
    end_date_where_clause = f"""
        and metrc_download_summaries.date <= '{end_date}'
    """ if end_date else ''
    return f"""
        select
            metrc_download_summaries.license_number,
            metrc_download_summaries.date,
            metrc_download_summaries.status
        from
            metrc_download_summaries
            inner join companies on metrc_download_summaries.company_id = companies.id
        where
            True
            and companies.identifier = '{company_identifier}'
            and metrc_download_summaries.date >= '{start_date}'
            {end_date_where_clause}
        order by
            date desc
    """

def create_company_incoming_transfer_packages_query(company_identifier, start_date, end_date=None):
    end_date_where_clause = f"""
        and metrc_transfers.created_date <= '{end_date}'
    """ if end_date else ''
    return f"""
        select
            metrc_transfer_packages.id as package_row_id,
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
            and companies.identifier = '{company_identifier}'
            and (
                company_deliveries.delivery_type = 'INCOMING_FROM_VENDOR' or
                company_deliveries.delivery_type = 'INCOMING_INTERNAL' or
                company_deliveries.delivery_type = 'INCOMING_UNKNOWN'
            )
            and metrc_transfers.created_date >= '{start_date}'
            {end_date_where_clause}
        order by
            created_date desc
    """

def create_company_outgoing_transfer_packages_query(company_identifier, start_date):
    return f"""
        select
            metrc_transfer_packages.id as package_row_id,
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
            and companies.identifier = '{company_identifier}'
            and (
                company_deliveries.delivery_type = 'OUTGOING_TO_PAYOR' or
                company_deliveries.delivery_type = 'OUTGOING_INTERNAL' or
                company_deliveries.delivery_type = 'OUTGOING_UNKNOWN'
            )
            and metrc_transfers.created_date >= '{start_date}'
        order by
            metrc_transfers.created_date desc
    """

def create_company_grouped_gmv_by_receipts_query(company_identifier, start_date, group_type):
    if group_type not in ['week', 'month']:
        return 'Invalid group type'
    return f"""
        select
            date_trunc(metrc_sales_receipts.sales_datetime, {group_type}) as sales_{group_type},
            sum(metrc_sales_receipts.total_price) as month_gmv
        from
            metrc_sales_receipts
            inner join companies on metrc_sales_receipts.company_id = companies.id
        where
            True
            and companies.identifier = '{company_identifier}'
            and metrc_sales_receipts.sales_datetime >= '{start_date}'
        group by
            1
        order by
            1
    """

def create_company_weekly_gmv_by_receipts_query(company_identifier, start_date):
    return create_company_grouped_gmv_by_receipts_query(company_identifier, start_date, 'week')

def create_company_monthly_gmv_by_receipts_query(company_identifier, start_date):
    return create_company_grouped_gmv_by_receipts_query(company_identifier, start_date, 'month')

def create_company_monthly_units_sold_query(company_identifier, start_date):
    return f"""
        select
            date_trunc(metrc_sales_receipts.sales_datetime, month) as sales_month,
            sum(metrc_sales_transactions.quantity_sold) as month_units_sold
        from
            metrc_sales_receipts
            inner join companies on metrc_sales_receipts.company_id = companies.id
            inner join metrc_sales_transactions on metrc_sales_receipts.id = metrc_sales_transactions.receipt_row_id
        where
            True
            and companies.identifier = '{company_identifier}'
            and metrc_sales_receipts.sales_datetime >= '{start_date}'
            and metrc_sales_transactions.unit_of_measure = 'Each'
        group by
            1
        order by
            1
    """

def create_company_sales_receipts_query(company_identifier, start_date):
    return f"""
        select
            metrc_sales_receipts.id,
            metrc_sales_receipts.license_number,
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
            and companies.identifier = '{company_identifier}'
            and metrc_sales_receipts.sales_datetime >= '{start_date}'
        order by
            metrc_sales_receipts.sales_datetime desc
    """

def create_company_sales_receipts_with_transactions_query(company_identifier, start_date):
    """
    Note the left outer join of metrc_sales_transactions.
    """
    return f"""
        select
            metrc_sales_receipts.id as rt_id,
            metrc_sales_receipts.license_number,
            metrc_sales_receipts.receipt_number,
            metrc_sales_receipts.type as rt_type,
            metrc_sales_receipts.sales_customer_type,
            metrc_sales_receipts.sales_datetime,
            metrc_sales_receipts.total_packages,
            metrc_sales_receipts.total_price as rt_total_price,
            metrc_sales_transactions.id as tx_id,
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
            and companies.identifier = '{company_identifier}'
            and metrc_sales_receipts.sales_datetime >= '{start_date}'
        order by
            metrc_sales_receipts.sales_datetime desc
    """

def create_company_sales_transactions_query(company_identifier, start_date):
    return f"""
        select
            metrc_sales_receipts.id,
            metrc_sales_receipts.license_number,
            metrc_sales_receipts.receipt_number,
            metrc_sales_receipts.type as rt_type,
            metrc_sales_receipts.sales_customer_type,
            metrc_sales_receipts.sales_datetime,
            metrc_sales_receipts.total_packages,
            metrc_sales_receipts.total_price as rt_total_price,
            metrc_sales_transactions.type as tx_type,
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
            and companies.identifier = '{company_identifier}'
            and metrc_sales_receipts.sales_datetime >= '{start_date}'
        order by
            metrc_sales_receipts.sales_datetime desc
    """

def create_company_inventory_packages_query(company_identifier, include_quantity_zero = False):
    extra_and_str = '' if include_quantity_zero else 'and metrc_packages.quantity > 0'
    return f"""
        select
            metrc_packages.license_number,
            metrc_packages.package_id,
            metrc_packages.package_label,
            metrc_packages.type,
            metrc_packages.packaged_date,
            metrc_packages.package_type,
            metrc_packages.product_name,
            metrc_packages.product_category_name,
            metrc_packages.quantity,
            metrc_packages.unit_of_measure,
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
            and companies.identifier = '{company_identifier}'
            and (
                metrc_packages.type = 'active' or
                metrc_packages.type = 'onhold'
            )
            {extra_and_str}
        order by
            metrc_packages.packaged_date desc
    """

# ID queries: get data by IDs.
def create_sales_transactions_by_package_id_query(package_id):
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
            and metrc_sales_transactions.package_id = '{package_id}'
    """

def create_transfer_packages_by_package_id_query(package_id):
    return f"""
        select
            companies.identifier,
            company_deliveries.delivery_type,
            company_deliveries.updated_at,
            metrc_deliveries.received_datetime,
            metrc_transfer_packages.package_id,
            metrc_transfer_packages.package_label,
            metrc_transfer_packages.package_payload.packagetype,
            metrc_transfer_packages.shipped_quantity,
            metrc_transfer_packages.shipper_wholesale_price,
            metrc_transfer_packages.received_quantity,
            metrc_transfers.shipper_facility_name,
            metrc_transfers.shipper_facility_license_number,
            metrc_deliveries.recipient_facility_name,
            metrc_deliveries.recipient_facility_license_number
        from
            metrc_transfer_packages
            inner join metrc_deliveries on metrc_transfer_packages.delivery_row_id = metrc_deliveries.id
            inner join metrc_transfers on metrc_deliveries.transfer_row_id = metrc_transfers.id
            left outer join company_deliveries on metrc_transfers.id = company_deliveries.transfer_row_id
            left outer join companies on company_deliveries.company_id = companies.id
        where
            True
            and metrc_transfer_packages.package_id = '{package_id}'
    """

def create_packages_by_package_id_query(package_id):
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
            and metrc_packages.package_id = '{package_id}'
    """

# Other identifier queries: get data by non-ID identifiers.
def create_packages_by_production_batch_number_query(production_batch_number):
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
            and metrc_packages.package_payload.productionbatchnumber = '{production_batch_number}'
    """

def create_packages_by_source_production_batch_number_query(source_production_batch_number):
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
            and metrc_packages.package_payload.sourceproductionbatchnumbers like '%{source_production_batch_number}%'
    """
