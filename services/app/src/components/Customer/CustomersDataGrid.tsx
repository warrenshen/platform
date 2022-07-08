import { RowsProp } from "@material-ui/data-grid";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import {
  Companies,
  CustomerForBankFragment,
  CustomersWithMetadataFragment,
} from "generated/graphql";
import { parseDateStringServer } from "lib/date";
import {
  CustomerSurveillanceCategoryEnum,
  DebtFacilityCompanyStatusEnum,
  DebtFacilityCompanyStatusToLabel,
  ProductTypeEnum,
  ProductTypeToLabel,
} from "lib/enum";
import { CurrencyPrecision, PercentPrecision } from "lib/number";
import { BankCompanyRouteEnum, getBankCompanyRoute } from "lib/routes";
import { ColumnWidths, formatRowModel } from "lib/tables";
import { Dispatch, SetStateAction, useMemo } from "react";

interface Props {
  isDebtFacilityVisible?: boolean;
  isMultiSelectEnabled?: boolean;
  customers: CustomersWithMetadataFragment[];
  selectedCompanyIds: Companies["id"][];
  setSelectedCompanyIds: Dispatch<SetStateAction<Companies["id"][]>>;
}

function getBorrowingBaseDate(company: CustomersWithMetadataFragment) {
  const borrowingBaseDate = !!company?.ebba_applications
    ? company.ebba_applications.filter(
        ({ category }) =>
          category === CustomerSurveillanceCategoryEnum.BorrowingBase
      )[0]?.application_date
    : null;

  return !!borrowingBaseDate ? parseDateStringServer(borrowingBaseDate) : null;
}

function getApplicationDate(company: CustomersWithMetadataFragment) {
  const applicationDate = !!company?.ebba_applications
    ? company.ebba_applications.filter(
        ({ category }) =>
          category === CustomerSurveillanceCategoryEnum.FinancialReport
      )[0]?.application_date
    : null;

  return !!applicationDate ? parseDateStringServer(applicationDate) : null;
}

function getRows(customers: CustomersWithMetadataFragment[]): RowsProp {
  return customers.map((company) => {
    return formatRowModel({
      ...company,
      adjusted_total_limit: !!company?.financial_summaries?.[0]
        ? company.financial_summaries[0].adjusted_total_limit
        : null,
      application_date: getApplicationDate(company),
      borrowing_base_date: getBorrowingBaseDate(company),
      company_url: getBankCompanyRoute(
        company.id,
        BankCompanyRouteEnum.Overview
      ),
      cy_identifier: `customers-data-grid-view-customer-button-${company.identifier}`,
      daily_interest_rate: !!company?.financial_summaries?.[0]
        ?.daily_interest_rate
        ? company.financial_summaries[0].daily_interest_rate
        : null,
      debt_facility_status: !!company?.debt_facility_status
        ? (company.debt_facility_status as DebtFacilityCompanyStatusEnum)
        : null,
      holding_account_balance:
        !!company?.financial_summaries[0]?.account_level_balance_payload.hasOwnProperty(
          "credits_total"
        )
          ? company.financial_summaries[0].account_level_balance_payload[
              "credits_total"
            ]
          : null,
      outstanding_account_fees:
        !!company?.financial_summaries?.[0]?.account_level_balance_payload.hasOwnProperty(
          "fees_total"
        )
          ? company.financial_summaries[0].account_level_balance_payload[
              "fees_total"
            ]
          : null,
      product_type: !!company?.financial_summaries?.[0]
        ? ProductTypeToLabel[
            company.financial_summaries[0].product_type as ProductTypeEnum
          ]
        : "None",
      state: !!company?.state ? company.state : null,
      total_outstanding_interest: !!company?.financial_summaries?.[0]
        ? company.financial_summaries[0].total_outstanding_interest
        : null,
      total_outstanding_fees: !!company?.financial_summaries?.[0]
        ? company.financial_summaries[0].total_outstanding_fees
        : null,
      total_outstanding_principal: !!company?.financial_summaries?.[0]
        ? company.financial_summaries[0].total_outstanding_principal
        : null,
    });
  });
}

export default function CustomersDataGrid({
  isDebtFacilityVisible = false,
  isMultiSelectEnabled = false,
  customers,
  selectedCompanyIds,
  setSelectedCompanyIds,
}: Props) {
  const rows = customers ? getRows(customers) : [];

  const columns = useMemo(
    () => [
      {
        fixed: true,
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
        fixed: true,
        dataField: "identifier",
        caption: "Identifier",
        minWidth: ColumnWidths.Identifier,
        width: ColumnWidths.Type,
      },
      {
        fixed: true,
        dataField: "product_type",
        caption: "Product Type",
        width: ColumnWidths.ProductType,
      },
      {
        fixed: true,
        dataField: "state",
        caption: "US State",
        minWidth: ColumnWidths.Identifier,
        width: ColumnWidths.UsState,
      },
      {
        visible: isDebtFacilityVisible,
        dataField: "debt_facility_status",
        caption: "Debt Facility Status",
        width: ColumnWidths.ProductType,
        lookup: {
          dataSource: {
            store: {
              type: "array",
              data: Object.values(DebtFacilityCompanyStatusEnum).map(
                (debtFacilityStatus) => ({
                  debt_facility_status: debtFacilityStatus,
                  label: DebtFacilityCompanyStatusToLabel[debtFacilityStatus],
                })
              ),
              key: "debt_facility_status",
            },
          },
          valueExpr: "debt_facility_status",
          displayExpr: "label",
        },
      },
      {
        dataField: "contract_name",
        caption: "Contract Name",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "dba_name",
        caption: "DBA",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "adjusted_total_limit",
        format: "currency",
        caption: "Borrowing Limit",
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "application_date",
        format: "shortDate",
        caption: "Most Recent Financial Report Date",
        minWidth: ColumnWidths.Date,
        alignment: "right",
      },
      {
        dataField: "borrowing_base_date",
        format: "shortDate",
        caption: "Most Recent Borrowing Base Date",
        minWidth: ColumnWidths.Date,
        alignment: "right",
      },
      {
        dataField: "daily_interest_rate",
        format: {
          type: "percent",
          precision: PercentPrecision,
        },
        caption: "Daily Interest Rate",
        minWidth: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "total_outstanding_principal",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        caption: "Total Outstanding Principal",
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "total_outstanding_interest",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        caption: "Total Outstanding Interest",
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "total_outstanding_fees",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        caption: "Total Outstanding Late Fees",
        width: ColumnWidths.Currency,
      },
      {
        dataField: "outstanding_account_fees",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        caption: "Outstanding Account Fees",
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "holding_account_balance",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        caption: "Holding Account Balance",
        width: ColumnWidths.Currency,
        alignment: "right",
      },
    ],
    [isDebtFacilityVisible]
  );

  const handleSelectCompanies = useMemo(
    () => (companies: CustomerForBankFragment[]) => {
      setSelectedCompanyIds(companies.map((company) => company.id));
    },
    [setSelectedCompanyIds]
  );

  const handleSelectionChanged = useMemo(
    () =>
      ({ selectedRowsData }: any) =>
        handleSelectCompanies &&
        handleSelectCompanies(selectedRowsData as CustomerForBankFragment[]),
    [handleSelectCompanies]
  );

  return (
    <ControlledDataGrid
      isExcelExport
      pager
      select={isMultiSelectEnabled}
      filtering={{ enable: true }}
      dataSource={rows}
      columns={columns}
      selectedRowKeys={selectedCompanyIds}
      onSelectionChanged={handleSelectionChanged}
    />
  );
}
