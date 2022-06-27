import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import CustomerSurveillanceDrawer from "components/CustomerSurveillance/CustomerSurveillanceDrawer";
import CustomerSurveillanceStatusChip from "components/CustomerSurveillance/CustomerSurveillanceStatusChip";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import MetrcLogo from "components/Shared/Images/MetrcLogo.png";
import {
  CustomerSurveillanceFragment,
  GetCustomersSurveillanceSubscription,
} from "generated/graphql";
import {
  getBorrowingBaseApplicationDate,
  getCustomerProductType,
  getCustomerQualifyingProduct,
  getCustomerSurveillanceStatus,
  getDaysUntilBorrowingBaseExpires,
  getDaysUntilFinancialReportExpires,
  getFinancialReportApplicationDate,
  getLoansAwaitingForAdvanceAmount,
  getMostPastDueLoanDays,
  getPercentagePastDue,
  isCustomerFinancialsMetrcBased,
} from "lib/customerSurveillance";
import {
  ProductTypeEnum,
  ProductTypeToLabel,
  QualifyForEnum,
  QualifyForToLabel,
  SurveillanceStatusEnum,
  SurveillanceStatusToLabel,
} from "lib/enum";
import { PercentPrecision } from "lib/number";
import { BankCompanyRouteEnum, getBankCompanyRoute } from "lib/routes";
import { ColumnWidths, formatRowModel } from "lib/tables";
import { useMemo, useState } from "react";

interface Props {
  isExcelExport?: boolean;
  isMultiSelectEnabled?: boolean;
  isFinancialReportDateVisible?: boolean;
  isBorrowingBaseDateVisible?: boolean;
  isLoansReadyForAdvancesAmountVisible?: boolean;
  isCurrent?: boolean;
  customers: GetCustomersSurveillanceSubscription["customers"];
  selectedCompaniesIds?: CustomerSurveillanceFragment["id"][];
  targetDate: string;
  handleSelectCompanies?: (companies: CustomerSurveillanceFragment[]) => void;
}

function getRows(
  customers: GetCustomersSurveillanceSubscription["customers"],
  isCurrent: boolean
): RowsProp {
  return customers.map((customer) => {
    const productType = getCustomerProductType(customer) as ProductTypeEnum;
    const percentagePastDue = getPercentagePastDue(customer);

    const { borrowingBaseDate } = getBorrowingBaseApplicationDate(customer);
    const { financialReportDate } = getFinancialReportApplicationDate(customer);
    const {
      daysUntilBorrowingBaseExpiresNumber,
      daysUntilBorrowingBaseExpiresString,
    } = getDaysUntilBorrowingBaseExpires(customer, productType);
    const {
      daysUntilFinancialReportExpiresNumber,
      daysUntilFinancialReportExpiresString,
    } = getDaysUntilFinancialReportExpires(customer);
    const isMetrcBased = isCustomerFinancialsMetrcBased(customer);

    return formatRowModel({
      ...customer,
      customer_url: getBankCompanyRoute(
        customer.id,
        BankCompanyRouteEnum.Overview
      ),
      days_until_borrowing_base_expires_number:
        daysUntilBorrowingBaseExpiresNumber,
      days_until_borrowing_base_expires_string:
        daysUntilBorrowingBaseExpiresString,
      days_until_financial_report_expires_number: !!isMetrcBased
        ? -1
        : daysUntilFinancialReportExpiresNumber,
      days_until_financial_report_expires_string:
        daysUntilFinancialReportExpiresString,
      is_customer_metrc_based: isMetrcBased,
      loans_ready_for_advances_amount:
        getLoansAwaitingForAdvanceAmount(customer),
      most_overdue_loan_days: getMostPastDueLoanDays(customer),
      most_recent_borrowing_base: borrowingBaseDate,
      most_recent_financial_report: financialReportDate,
      percentage_past_due: percentagePastDue,
      product_type: productType,
      qualifying_product: getCustomerQualifyingProduct(customer, isCurrent),
      selected_month_surveillance_status: getCustomerSurveillanceStatus(
        customer,
        isCurrent
      ),
    });
  });
}

export default function CustomerSurveillanceDataGrid({
  isExcelExport = true,
  isFinancialReportDateVisible = false,
  isBorrowingBaseDateVisible = false,
  isMultiSelectEnabled = false,
  isLoansReadyForAdvancesAmountVisible = false,
  isCurrent = false,
  customers,
  selectedCompaniesIds,
  targetDate,
  handleSelectCompanies,
}: Props) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<
    CustomerSurveillanceFragment["id"] | null
  >(null);

  // NOTE: This is a temporary measure until we can add sorting
  // via graphql. The short version of the problem is that the
  // text data type doesn't sort in a case agnostic manner. There
  // are proposed and viable looking solution in the following
  // github links, but we wanted to defer the work in favor of
  // other tasks
  // references the citext type
  // https://github.com/graphile/postgraphile/issues/1087
  // reference the setup needed for citext + Hasura
  // https://github.com/hasura/graphql-engine/issues/2038
  const sortedCustomers = customers.sort((a, b) => {
    return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
  });

  const rows = sortedCustomers ? getRows(sortedCustomers, isCurrent) : [];

  const columns = useMemo(
    () => [
      {
        fixed: true,
        dataField: "id",
        caption: "",
        width: ColumnWidths.Open,
        cellRender: (params: ValueFormatterParams) => (
          <ClickableDataGridCell
            onClick={() => setSelectedCustomerId(params.row.data.id)}
            label={"OPEN"}
          />
        ),
      },
      {
        fixed: true,
        dataField: "name",
        caption: "Customer Name",
        width: ColumnWidths.Comment,
        alignment: "left",
        cellRender: ({ value, data }: { value: string; data: any }) => (
          <ClickableDataGridCell
            dataCy={data.cy_identifier}
            url={data.customer_url}
            label={value}
          />
        ),
      },
      {
        fixed: true,
        dataField: "selected_month_surveillance_status",
        caption: "Surveillance Stage",
        width: ColumnWidths.Status,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) => (
          <CustomerSurveillanceStatusChip
            surveillanceStatus={
              params.row.data.selected_month_surveillance_status
            }
          />
        ),
        lookup: {
          dataSource: {
            store: {
              type: "array",
              data: Object.values(SurveillanceStatusEnum).map((status) => ({
                selected_month_surveillance_status: status,
                label: SurveillanceStatusToLabel[status],
              })),
              key: "selected_month_surveillance_status",
            },
          },
          valueExpr: "selected_month_surveillance_status",
          displayExpr: "label",
        },
      },
      {
        dataField: "product_type",
        caption: "Current Product",
        alignment: "center",
        width: ColumnWidths.Status,
        lookup: {
          dataSource: {
            store: {
              type: "array",
              data: Object.values(ProductTypeEnum).map((product) => ({
                product_type: product,
                label: ProductTypeToLabel[product],
              })),
              key: "product_type",
            },
          },
          valueExpr: "product_type",
          displayExpr: "label",
        },
      },
      {
        dataField: "qualifying_product",
        caption: "Qualifying for",
        width: ColumnWidths.Datetime,
        alignment: "center",
        lookup: {
          dataSource: {
            store: {
              type: "array",
              data: Object.values(QualifyForEnum).map((product) => ({
                qualifying_product: product,
                label: QualifyForToLabel[product],
              })),
              key: "qualifying_product",
            },
          },
          valueExpr: "qualifying_product",
          displayExpr: "label",
        },
      },
      {
        visible: isCurrent,
        dataField: "most_recent_financial_report",
        format: "shortDate",
        caption: "Most Recent Financial Report",
        width: ColumnWidths.Datetime,
        alignment: "center",
      },
      {
        visible: isFinancialReportDateVisible,
        dataField: "days_until_financial_report_expires_number",
        format: "decimal",
        caption: "Days Until Financial Report Expires",
        width: ColumnWidths.Date,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) => {
          return !!params.row.data.is_customer_metrc_based ? (
            <img src={MetrcLogo} alt="Metrc Logo" width={24} height={24} />
          ) : (
            <>{params.row.data.days_until_financial_report_expires_number}</>
          );
        },
      },
      {
        visible: isCurrent,
        dataField: "most_recent_borrowing_base",
        format: "shortDate",
        caption: "Most Recent Borrowing Base",
        width: ColumnWidths.Datetime,
        alignment: "center",
      },
      {
        visible: isBorrowingBaseDateVisible,
        dataField: "days_until_borrowing_base_expires_number",
        format: "decimal",
        caption: "Days Until Borrowing Base Expires",
        width: ColumnWidths.Date,
        alignment: "center",
      },
      {
        visible: isCurrent,
        dataField: "percentage_past_due",
        format: {
          type: "percent",
          precision: PercentPrecision,
        },
        caption: "% Past Due",
        width: ColumnWidths.MinWidth,
        alignment: "center",
      },
      {
        visible: isCurrent,
        dataField: "most_overdue_loan_days",
        caption: "Most Overdue Loan",
        width: ColumnWidths.MinWidth,
        alignment: "center",
      },
      {
        visible: isLoansReadyForAdvancesAmountVisible,
        dataField: "loans_ready_for_advances_amount",
        format: "currency",
        caption: "Loans Ready For Advances Amount",
        width: ColumnWidths.MinWidth,
        alignment: "center",
      },
    ],
    [
      isBorrowingBaseDateVisible,
      isCurrent,
      isFinancialReportDateVisible,
      isLoansReadyForAdvancesAmountVisible,
    ]
  );

  const handleSelectionChanged = useMemo(
    () =>
      ({ selectedRowsData }: any) =>
        handleSelectCompanies && handleSelectCompanies(selectedRowsData),
    [handleSelectCompanies]
  );

  return (
    <>
      {!!selectedCustomerId && (
        <CustomerSurveillanceDrawer
          isCurrent
          customerId={selectedCustomerId}
          targetDate={targetDate}
          handleClose={() => setSelectedCustomerId(null)}
        />
      )}
      <ControlledDataGrid
        isExcelExport={isExcelExport}
        pager
        select={isMultiSelectEnabled}
        filtering={{ enable: true }}
        dataSource={rows}
        columns={columns}
        selectedRowKeys={selectedCompaniesIds}
        onSelectionChanged={handleSelectionChanged}
      />
    </>
  );
}
