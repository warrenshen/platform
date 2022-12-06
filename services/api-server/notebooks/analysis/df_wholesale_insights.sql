-- data product: retail wholesale insights
----------------------------------------
--retail store's all incoming transfers
----------------------------------------
with all_retail_incoming as (
  select 
    COALESCE(
      company_licenses.company_id, incoming.shipper_facility_license_number
    ) shipper_company_id, 
    COALESCE(
      companies.parent_company_id, incoming.shipper_facility_license_number
    ) shipper_parent_company_id, 
    COALESCE(
      parent_companies.name, incoming.shipper_facility_name
    ) shipper_parent_name, 
    incoming.created_date, 
    last_day(incoming.created_date) created_month, 
    incoming.received_datetime, 
    incoming.shipper_facility_name, 
    incoming.recipient_facility_name, 
    incoming.recipient_facility_license_number, 
    r_company_licenses.license_category recipient_license_category, 
    incoming.package_id, 
    incoming.manifest_number, 
    incoming.type, 
    incoming.product_name, 
    incoming.product_category_name, 
    incoming.shipped_unit_of_measure uom, 
    incoming.shipper_wholesale_price, 
    incoming.shipped_quantity, 
    incoming.shipper_wholesale_price / nullif(incoming.shipped_quantity, 0) unit_price, 
    incoming.receiver_wholesale_price, 
    incoming.updated_at 
  from 
    dbt_transformation.int__company_outgoing_transfer_packages incoming 
    left join dbt_transformation.stg__company_licenses company_licenses on incoming.shipper_facility_license_number = company_licenses.license_number 
    left join dbt_transformation.stg__companies companies on company_licenses.company_id = companies.id 
    left join dbt_transformation.stg__parent_companies parent_companies on companies.parent_company_id = parent_companies.id 
    left join `bespoke-financial`.ProdMetrcData.company_licenses r_company_licenses on incoming.recipient_facility_license_number = r_company_licenses.license_number 
  where 
    DATE(incoming.created_date) >= DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY)
    and DATE(incoming.created_date) < CURRENT_DATE()
    and incoming.recipient_facility_license_number in ('C10-0000774-LIC') --CHANGE RETAIL LICENSE NUMBER HERE
    and incoming.shipper_wholesale_price < 1000000
), 
--------------------------------------------------------------
--retail store's all incoming transfers with clean unit price
--------------------------------------------------------------
all_retail_incoming_with_filter as (
  select 
    * 
  from 
    all_retail_incoming 
  where 
    unit_price > 0.1 
    and unit_price < 500
), 
--------------------------------------------------------------
--take the retail store's top 3 purchased product cat
--------------------------------------------------------------
top_prod_cat as (
  select 
    product_category_name, 
    uom, 
    sum(shipped_quantity) total_quantity, 
  from 
    all_retail_incoming_with_filter 
  group by 
    1, 
    2 
  order by 
    3 desc 
  limit 
    5
), 
---------------------------------------------------------------------------------
--take the retail store's top 3 purchased product cat: top 10 products
---------------------------------------------------------------------------------
all_product as (
  select 
    product_category_name, 
    product_name, 
    shipper_parent_name, 
    sum(shipped_quantity) total_quantity 
  from 
    (
      select 
        all_retail_incoming_with_filter.* 
      from 
        all_retail_incoming_with_filter 
        inner join top_prod_cat on all_retail_incoming_with_filter.product_category_name = top_prod_cat.product_category_name
    ) 
  group by 
    1, 
    2, 
    3
), 
top_product as (
  select 
    * 
  from 
    (
      select 
        *, 
        RANK() over (
          partition by product_category_name 
          order by 
            total_quantity desc
        ) r 
      from 
        all_product
    ) 
  where 
    r <= 20
), 
------------------------------
-- start retail cost analysis
------------------------------
retail_cost as (
  select 
    all_retail_incoming_with_filter.* 
  from 
    all_retail_incoming_with_filter 
    inner join top_product on all_retail_incoming_with_filter.product_name = top_product.product_name
), 
po_size as (
  select 
    product_name, 
    avg(total_po_amount_market) avg_total_po_amount_retail 
  from 
    (
      select 
        product_name, 
        manifest_number, 
        sum(shipper_wholesale_price) over (partition by manifest_number) total_po_amount_market 
      from 
        all_retail_incoming_with_filter
    ) 
  group by 
    1
), 
retail_cost_summary as (
  select 
    recipient_facility_name, 
    product_category_name, 
    product_name, 
    shipper_parent_name, 
    min(unit_price) min_unit_price, 
    AVG(unit_price) avg_unit_price, 
    max(unit_price) max_unit_price, 
    count(*) count_orders 
  from 
    retail_cost 
  group by 
    1, 
    2, 
    3, 
    4
), 
retail_cost_summary_with_po as (
  select 
    retail_cost_summary.*, 
    po_size.avg_total_po_amount_retail 
  from 
    retail_cost_summary 
    left join po_size on retail_cost_summary.product_name = po_size.product_name
), 
------------------------------
-- start market cost analysis
------------------------------
all_retail_incoming_market as (
  select 
    COALESCE(
      company_licenses.company_id, incoming.shipper_facility_license_number
    ) shipper_company_id, 
    COALESCE(
      companies.parent_company_id, incoming.shipper_facility_license_number
    ) shipper_parent_company_id, 
    COALESCE(
      parent_companies.name, incoming.shipper_facility_name
    ) shipper_parent_name, 
    incoming.created_date, 
    last_day(incoming.created_date) created_month, 
    incoming.received_datetime, 
    incoming.shipper_facility_name, 
    incoming.recipient_facility_name, 
    incoming.recipient_facility_license_number, 
    r_company_licenses.license_category recipient_license_category, 
    incoming.package_id, 
    incoming.manifest_number, 
    incoming.type, 
    incoming.product_name, 
    incoming.product_category_name, 
    incoming.shipped_unit_of_measure uom, 
    incoming.shipper_wholesale_price, 
    incoming.shipped_quantity, 
    incoming.shipper_wholesale_price / nullif(incoming.shipped_quantity, 0) unit_price, 
    incoming.receiver_wholesale_price, 
    incoming.updated_at 
  from 
    dbt_transformation.int__company_outgoing_transfer_packages incoming 
    left join dbt_transformation.stg__company_licenses company_licenses on incoming.shipper_facility_license_number = company_licenses.license_number 
    left join dbt_transformation.stg__companies companies on company_licenses.company_id = companies.id 
    left join dbt_transformation.stg__parent_companies parent_companies on companies.parent_company_id = parent_companies.id 
    left join `bespoke-financial`.ProdMetrcData.company_licenses r_company_licenses on incoming.recipient_facility_license_number = r_company_licenses.license_number 
  where 
    r_company_licenses.license_category = 'Retailer' 
    and DATE(incoming.created_date) >= DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY)
    and DATE(incoming.created_date) < CURRENT_DATE()
    and incoming.shipper_wholesale_price < 1000000
), 
all_retail_incoming_with_filter_market as (
  select 
    *, 
    (
      AVG(unit_price) over (
        partition by product_name, shipper_parent_name
      )
    ) * 1.3 product_avg_upper, 
    (
      AVG(unit_price) over (
        partition by product_name, shipper_parent_name
      )
    ) * 0.7 product_avg_lower, 
  from 
    all_retail_incoming_market 
  where 
    unit_price > 0.5 
    and unit_price < 500
), 
po_size_market as (
  select 
    product_name, 
    avg(total_po_amount_market) avg_total_po_amount_market 
  from 
    (
      select 
        distinct product_name, 
        manifest_number, 
        sum(shipper_wholesale_price) over (partition by manifest_number) total_po_amount_market 
      from 
        all_retail_incoming_with_filter_market 
      where 
        unit_price >= product_avg_lower 
        and unit_price <= product_avg_upper
    ) 
  group by 
    1
), 
market_cost_summary as (
  select 
    shipper_parent_name, 
    product_category_name, 
    product_name, 
    min(
      all_retail_incoming_with_filter_market.unit_price
    ) min_unit_price_market, 
    AVG(
      all_retail_incoming_with_filter_market.unit_price
    ) avg_unit_price_market, 
    max(
      all_retail_incoming_with_filter_market.unit_price
    ) max_unit_price_market,
    count(*) as count_orders_market
  from 
    all_retail_incoming_with_filter_market 
  where 
    unit_price >= product_avg_lower 
    and unit_price <= product_avg_upper 
  group by 
    1, 
    2, 
    3
), 
market_cost_summary_with_po as (
  select 
    market_cost_summary.*, 
    po_size_market.avg_total_po_amount_market 
  from 
    market_cost_summary 
    left join po_size_market on po_size_market.product_name = market_cost_summary.product_name
), 
---------------------------------------------------------
-- join the retail store's summary with market to compare
---------------------------------------------------------
all_summary as (
  select 
    market_cost_summary_with_po.*, 
    retail_cost_summary_with_po.min_unit_price min_unit_price_retail, 
    retail_cost_summary_with_po.min_unit_price avg_unit_price_retail, 
    retail_cost_summary_with_po.min_unit_price max_unit_price_retail, 
    retail_cost_summary_with_po.avg_total_po_amount_retail, 
    retail_cost_summary_with_po.min_unit_price <= min_unit_price_market optimal_price 
  from 
    retail_cost_summary_with_po 
    inner join market_cost_summary_with_po on market_cost_summary_with_po.shipper_parent_name = retail_cost_summary_with_po.shipper_parent_name 
    and market_cost_summary_with_po.product_name = retail_cost_summary_with_po.product_name 
  order by 
    2, 
    3, 
    1
) 
select 
  * 
from 
  all_summary 
order by 
  optimal_price