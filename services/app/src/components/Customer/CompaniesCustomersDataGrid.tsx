import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import { CustomersWithMetadataFragment } from "generated/graphql";
import { ProductTypeEnum, ProductTypeToLabel } from "lib/enum";
import { CurrencyPrecision } from "lib/number";
import { BankCompanyRouteEnum, getBankCompanyRoute } from "lib/routes";
import { ColumnWidths, formatRowModel } from "lib/tables";
import { useMemo } from "react";

interface Props {
  customers: CustomersWithMetadataFragment[];
}

function getRows(customers: CustomersWithMetadataFragment[]) {
  return customers.map((company) => {
    return formatRowModel({
      ...company,
      adjusted_total_limit: !!company?.financial_summaries?.[0]
        ?.adjusted_total_limit
        ? company.financial_summaries[0].adjusted_total_limit
        : null,
      company_url: getBankCompanyRoute(
        company.id,
        BankCompanyRouteEnum.Overview
      ),
      cy_identifier: `customers-data-grid-view-customer-button-${company.identifier}`,
      product_type: !!company?.financial_summaries?.[0]
        ? ProductTypeToLabel[
            company.financial_summaries[0].product_type as ProductTypeEnum
          ]
        : "None",
    });
  });
}

export default function CompaniesCustomersDataGrid({ customers }: Props) {
  const rows = customers ? getRows(customers) : [];

  const columns = useMemo(
    () => [
      {
        dataField: "name",
        caption: "Customer Name",
        minWidth: ColumnWidths.MinWidth,
        cellRender: ({ value, data }: { value: string; data: any }) => (
          <ClickableDataGridCell
            dataCy={data.cy_identifier}
            url={data.company_url}
            label={value}
          />
        ),
      },
      {
        dataField: "product_type",
        caption: "Product Type",
        width: ColumnWidths.ProductType,
      },
      {
        dataField: "contract_name",
        caption: "Contract Name",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "adjusted_total_limit",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        caption: "Borrowing Limit",
        width: ColumnWidths.Currency,
        alignment: "right",
      },
    ],
    []
  );

  return (
    <ControlledDataGrid
      isExcelExport
      pager
      filtering={{ enable: true }}
      dataSource={rows}
      columns={columns}
    />
  );
}
