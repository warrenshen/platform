import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import CustomerSurveillanceDrawer from "components/CustomerSurveillance/CustomerSurveillanceDrawer";
import CustomerSurveillanceStatusChip from "components/CustomerSurveillance/CustomerSurveillanceStatusChip";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import {
  CustomerSurveillanceFragment,
  GetCustomersSurveillanceSubscription,
} from "generated/graphql";
import {
  getCustomerProductType,
  getCustomerQualifyingProduct,
  getCustomerSurveillanceStatus,
  getDaysUntilBorrowingBaseExpires,
  getDaysUntilFinancialReportExpires,
  getLoansAwaitingForAdvanceAmount,
  getMostPastDueLoanDays,
  getPercentagePastDue,
} from "lib/customerSurveillance";
import { ProductTypeEnum, ProductTypeToLabel } from "lib/enum";
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
    const [percentagePastDueNumber, percentagePastDueString] =
      getPercentagePastDue(customer);

    const [
      daysUntilFinancialReportExpiresNumber,
      daysUntilFinancialReportExpiresString,
    ] = getDaysUntilFinancialReportExpires(customer);
    const [
      daysUntilBorrowingBaseExpiresNumber,
      daysUntilBorrowingBaseExpiresString,
    ] = getDaysUntilBorrowingBaseExpires(customer);

    return formatRowModel({
      ...customer,
      customer_url: getBankCompanyRoute(
        customer.id,
        BankCompanyRouteEnum.Overview
      ),
      days_until_financial_report_expires_number:
        daysUntilFinancialReportExpiresNumber,
      days_until_financial_report_expires_string:
        daysUntilFinancialReportExpiresString,
      days_until_borrowing_base_expires_number:
        daysUntilBorrowingBaseExpiresNumber,
      days_until_borrowing_base_expires_string:
        daysUntilBorrowingBaseExpiresString,
      qualifying_product: getCustomerQualifyingProduct(customer, isCurrent),
      selected_month_surveillance_status: getCustomerSurveillanceStatus(
        customer,
        isCurrent
      ),
      product_type:
        ProductTypeToLabel[getCustomerProductType(customer) as ProductTypeEnum],
      percentage_past_due_number: percentagePastDueNumber,
      percentage_past_due_string: percentagePastDueString,
      most_overdue_loan_days: getMostPastDueLoanDays(customer),
      loans_ready_for_advances_amount:
        getLoansAwaitingForAdvanceAmount(customer),
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

  const rows = customers ? getRows(customers, isCurrent) : [];

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
      },
      {
        dataField: "product_type",
        caption: "Current Product",
        alignment: "center",
        width: ColumnWidths.Status,
      },
      {
        dataField: "qualifying_product",
        caption: "Qualifying for",
        width: ColumnWidths.Datetime,
        alignment: "center",
      },
      {
        visible: isFinancialReportDateVisible,
        dataField: "days_until_financial_report_expires_string",
        calculateSortValue: "days_until_financial_report_expires_number",
        caption: "Days Until Financial Report Expires",
        width: ColumnWidths.Date,
        alignment: "center",
      },
      {
        visible: isBorrowingBaseDateVisible,
        dataField: "days_until_borrowing_base_expires_string",
        calculateSortValue: "days_until_borrowing_base_expires_number",
        caption: "Days Until Borrowing Base Expires",
        width: ColumnWidths.Date,
        alignment: "center",
      },
      {
        dataField: "percentage_past_due_string",
        calculateSortValue: "percentage_past_due_number",
        caption: "% Past Due",
        width: ColumnWidths.MinWidth,
        alignment: "center",
      },
      {
        dataField: "most_overdue_loan_days",
        caption: "Most Overdue Loan",
        width: ColumnWidths.MinWidth,
        alignment: "center",
      },
      {
        visible: isLoansReadyForAdvancesAmountVisible,
        dataField: "loans_ready_for_advances_amount",
        caption: "Loans Ready For Advances Amount",
        width: ColumnWidths.MinWidth,
        alignment: "center",
      },
    ],
    [
      isBorrowingBaseDateVisible,
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
        dataSource={rows}
        columns={columns}
        selectedRowKeys={selectedCompaniesIds}
        onSelectionChanged={handleSelectionChanged}
      />
    </>
  );
}
