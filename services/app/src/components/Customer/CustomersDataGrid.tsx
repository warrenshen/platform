import { GridValueFormatterParams } from "@material-ui/data-grid";
import CustomerSurveillanceStatusChip from "components/CustomerSurveillance/CustomerSurveillanceStatusChip";
import DebtFacilityCompanyStatusChip from "components/Shared/Chip/DebtFacilityCompanyStatusChip";
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
  SurveillanceStatusEnum,
  SurveillanceStatusToLabel,
} from "lib/enum";
import { CurrencyPrecision, PercentPrecision } from "lib/number";
import { BankCompanyRouteEnum, getBankCompanyRoute } from "lib/routes";
import { ColumnWidths, formatRowModel } from "lib/tables";
import { Dispatch, SetStateAction, useMemo } from "react";

interface Props {
  isDebtFacilityVisible?: boolean;
  isFixedWidth?: boolean;
  isMultiSelectEnabled?: boolean;
  isSurveillanceStatusVisible?: boolean;
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

function getRows(customers: CustomersWithMetadataFragment[]) {
  return customers.map((company) => {
    return formatRowModel({
      ...company,
      // 0 is valid for `accounting_date_*` so instead of !!, we check for null
      accounting_outstanding_interest:
        !!company?.financial_summaries?.[0] &&
        company.financial_summaries[0].accounting_total_outstanding_interest !==
          null
          ? company.financial_summaries[0].accounting_total_outstanding_interest
          : null,
      accounting_outstanding_late_fees:
        !!company?.financial_summaries?.[0] &&
        company.financial_summaries[0]
          .accounting_total_outstanding_late_fees !== null
          ? company.financial_summaries[0]
              .accounting_total_outstanding_late_fees
          : null,
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
      surveillance_status: !!company?.most_recent_surveillance_result?.[0]
        ?.surveillance_status
        ? company.most_recent_surveillance_result[0].surveillance_status
        : null,
      total_outstanding_interest: !!company?.financial_summaries?.[0]
        ?.total_outstanding_interest
        ? company.financial_summaries[0].total_outstanding_interest
        : null,
      total_outstanding_fees: !!company?.financial_summaries?.[0]
        ?.total_outstanding_fees
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
  isFixedWidth = true,
  isMultiSelectEnabled = false,
  isSurveillanceStatusVisible = false,
  customers,
  selectedCompanyIds,
  setSelectedCompanyIds,
}: Props) {
  const rows = customers ? getRows(customers) : [];

  const columns = useMemo(
    () => [
      {
        fixed: true && isFixedWidth,
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
        fixed: true && isFixedWidth,
        dataField: "identifier",
        caption: "Identifier",
        minWidth: ColumnWidths.Identifier,
        width: ColumnWidths.Type,
      },
      {
        fixed: true && isFixedWidth,
        dataField: "product_type",
        caption: "Product Type",
        width: ColumnWidths.ProductType,
      },
      {
        fixed: true && isFixedWidth,
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
        cellRender: (params: GridValueFormatterParams) => (
          <DebtFacilityCompanyStatusChip
            debtFacilityCompanyStatus={params.row.data.debt_facility_status}
          />
        ),
      },
      {
        visible: isSurveillanceStatusVisible,
        dataField: "surveillance_status",
        caption: "Surveillance Status",
        width: ColumnWidths.ProductType,
        lookup: {
          dataSource: {
            store: {
              type: "array",
              data: Object.values(SurveillanceStatusEnum).map(
                (surveillanceStatus) => ({
                  surveillance_status: surveillanceStatus,
                  label: SurveillanceStatusToLabel[surveillanceStatus],
                })
              ),
              key: "surveillance_status",
            },
          },
          valueExpr: "surveillance_status",
          displayExpr: "label",
        },
        cellRender: (params: GridValueFormatterParams) => (
          <CustomerSurveillanceStatusChip
            surveillanceStatus={params.row.data.surveillance_status}
          />
        ),
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
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
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
      {
        visible: isDebtFacilityVisible,
        dataField: "accounting_outstanding_interest",
        caption: "Accounting Outstanding Interest",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        visible: isDebtFacilityVisible,
        dataField: "accounting_outstanding_late_fees",
        caption: "Outstanding Late Fees After End Date",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
    ],
    [isDebtFacilityVisible, isFixedWidth, isSurveillanceStatusVisible]
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
