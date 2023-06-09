import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import { ReactComponent as CompanyIcon } from "components/Shared/Layout/Icons/CompanyGreen.svg";
import { ReactComponent as ParentCompanyIcon } from "components/Shared/Layout/Icons/ParentCompanyGreen.svg";
import VerificationChip from "components/Vendors/v2/VerificationChip";
import { CustomersWithMetadataFragment } from "generated/graphql";
import { ProductTypeEnum, ProductTypeToLabel } from "lib/enum";
import {
  BankCompanyRouteEnum,
  BankParentCompanyRouteEnum,
  getBankCompanyRoute,
  getBankParentCompanyRoute,
} from "lib/routes";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

function getRows(companies: CustomersWithMetadataFragment[]) {
  return companies.map((company) => {
    return {
      ...company,
      company_name: company?.name || "",
      company_url: getBankCompanyRoute(
        company.id,
        BankCompanyRouteEnum.Overview
      ),
      cy_identifier:
        `companies-companies-data-grid-view-customer-button-${company.identifier}`
          .replace(/\s+/g, "-")
          .toLowerCase(),
      dba_name: company?.dba_name || "",
      is_vendor: company?.is_vendor || false,
      is_payor: company?.is_payor || false,
      is_customer: company?.is_customer || false,
      parent_company_name: company?.parent_company?.name || "",
      parent_company_url: getBankParentCompanyRoute(
        company?.parent_company?.id || "",
        BankParentCompanyRouteEnum.Details
      ),
      product_type: !!company?.financial_summaries?.[0]?.product_type
        ? ProductTypeToLabel[
            company.financial_summaries[0].product_type as ProductTypeEnum
          ]
        : "None",
      us_state: company?.state || "",
    };
  });
}

interface Props {
  companies: CustomersWithMetadataFragment[];
}

export default function CompaniesCompaniesDataGrid({ companies }: Props) {
  const verificationCellRenderer = useMemo(
    () =>
      ({ value }: { value: string }) =>
        <VerificationChip value={value} />,
    []
  );

  const rows = getRows(companies);
  const columns = useMemo(
    () => [
      {
        dataField: "company_name",
        caption: "Company Name",
        alignment: "left",
        minWidth: ColumnWidths.CompanyName,
        cellRender: ({ value, data }: { value: string; data: any }) => (
          <ClickableDataGridCell
            dataCy={data.cy_identifier}
            url={data.company_url}
            label={value}
            Icon={CompanyIcon}
          />
        ),
      },
      {
        dataField: "identifier",
        caption: "Identifier",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "dba_name",
        caption: "DBA",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "us_state",
        caption: "US State",
        minWidth: ColumnWidths.UsState,
      },
      {
        dataField: "parent_company_name",
        caption: "Parent Company",
        minWidth: ColumnWidths.CompanyName,
        cellRender: ({ value, data }: { value: string; data: any }) => (
          <ClickableDataGridCell
            dataCy={data.cy_identifier}
            url={data.parent_company_url}
            label={value}
            Icon={ParentCompanyIcon}
          />
        ),
      },
      {
        dataField: "is_customer",
        caption: "Customer BF",
        alignment: "center",
        width: ColumnWidths.Checkbox,
        cellRender: ({ value }: { value: string }) => (
          <VerificationChip value={value} />
        ),
      },
      {
        dataField: "is_payor",
        caption: "Payor BF",
        alignment: "center",
        width: ColumnWidths.Checkbox,
        cellRender: verificationCellRenderer,
      },
      {
        dataField: "is_vendor",
        caption: "Vendor BF",
        alignment: "center",
        width: ColumnWidths.Checkbox,
        cellRender: verificationCellRenderer,
      },
      {
        dataField: "product_type",
        caption: "Product Type",
        minWidth: ColumnWidths.MinWidth,
      },
    ],
    [verificationCellRenderer]
  );

  const onFilteringChanged = (index: number, value: string) => {};

  return (
    <ControlledDataGrid
      pager
      dataSource={rows}
      onFilteringChanged={onFilteringChanged}
      columns={columns}
    />
  );
}
