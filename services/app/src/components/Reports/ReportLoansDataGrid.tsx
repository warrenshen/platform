import { GridValueFormatterParams } from "@material-ui/data-grid";
import InvoiceDrawerLauncher from "components/Invoices/InvoiceDrawerLauncher";
import LoanDrawerLauncher from "components/Loan/LoanDrawerLauncher";
import PurchaseOrderDrawerLauncher from "components/PurchaseOrder/PurchaseOrderDrawerLauncher";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import DataGridActionMenu, {
  DataGridActionItem,
} from "components/Shared/DataGrid/DataGridActionMenu";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
import TextDataGridCell from "components/Shared/DataGrid/TextDataGridCell";
import {
  Companies,
  LoanArtifactFragment,
  LoanArtifactLimitedFragment,
  LoanFragment,
  LoanReportFragment,
  Loans,
  Maybe,
  RequestStatusEnum,
} from "generated/graphql";
import { parseDateStringServer } from "lib/date";
import {
  createLoanCustomerIdentifier,
  createLoanDisbursementIdentifier,
  getLoanArtifactName,
  getLoanVendorName,
} from "lib/loans";
import { ColumnWidths, truncateString } from "lib/tables";
import { useEffect, useMemo, useState } from "react";

interface Props {
  isArtifactVisible?: boolean;
  isArtifactBankNoteVisible?: boolean;
  isCompanyVisible?: boolean;
  isDaysPastDueVisible?: boolean;
  isDisbursementIdentifierVisible?: boolean;
  isExcelExport?: boolean;
  isFilteringEnabled?: boolean;
  isMaturityVisible?: boolean;
  isMultiSelectEnabled?: boolean;
  isReportingVisible?: boolean;
  isSortingDisabled?: boolean;
  isStatusVisible?: boolean;
  pager?: boolean;
  matureDays?: number;
  pageSize?: number;
  filterByStatus?: RequestStatusEnum;
  loans: (LoanFragment &
    (LoanArtifactFragment | LoanArtifactLimitedFragment))[];
  actionItems?: DataGridActionItem[];
  selectedLoanIds?: Loans["id"][];
  handleClickCustomer?: (customerId: Companies["id"]) => void;
  handleSelectLoans?: (loans: LoanFragment[]) => void;
}

function getRows(
  loans: (LoanFragment & {
    loan_report?: Maybe<LoanReportFragment>;
  } & (LoanArtifactFragment | LoanArtifactLimitedFragment))[]
) {
  return loans.map((loan) => ({
    ...loan,
    customer_identifier: createLoanCustomerIdentifier(loan),
    disbursement_identifier: createLoanDisbursementIdentifier(loan),
    artifact_name: getLoanArtifactName(loan),
    artifact_bank_note: loan.purchase_order
      ? truncateString(
          (loan as LoanArtifactFragment).purchase_order?.bank_note || ""
        )
      : "N/A",
    vendor_name: getLoanVendorName(loan),
    financing_period: !!loan.loan_report
      ? loan.loan_report.financing_period
      : null,
    financing_day_limit: !!loan.loan_report
      ? loan.loan_report.financing_day_limit
      : null,
    total_principal_paid: !!loan.loan_report
      ? loan.loan_report.total_principal_paid
      : null,
    total_interest_paid: !!loan.loan_report
      ? loan.loan_report.total_interest_paid
      : null,
    total_fees_paid: !!loan.loan_report
      ? loan.loan_report.total_fees_paid
      : null,
  }));
}

const getMaturityDate = (rowData: any) => {
  return parseDateStringServer(rowData.adjusted_maturity_date);
};

export default function ReportLoansDataGrid({
  isArtifactVisible = false,
  isArtifactBankNoteVisible = false,
  isCompanyVisible = false,
  isDaysPastDueVisible = false,
  isDisbursementIdentifierVisible = false,
  isExcelExport = true,
  isFilteringEnabled = false,
  isMaturityVisible = false,
  isMultiSelectEnabled = false,
  isReportingVisible = false,
  isSortingDisabled = false,
  isStatusVisible = true,
  pager = true,
  matureDays = 0,
  pageSize = 10,
  filterByStatus,
  loans,
  actionItems,
  selectedLoanIds,
  handleClickCustomer,
  handleSelectLoans,
}: Props) {
  const [dataGrid, setDataGrid] = useState<any>(null);
  const rows = useMemo(() => getRows(loans), [loans]);

  useEffect(() => {
    if (!dataGrid) {
      return;
    }

    dataGrid.instance.clearFilter(getMaturityDate);

    if (matureDays > 0)
      dataGrid.instance.filter([
        [getMaturityDate, ">", new Date(Date.now())],
        "and",
        [
          getMaturityDate,
          "<",
          new Date(
            new Date(Date.now()).getTime() + matureDays * 24 * 60 * 60 * 1000
          ),
        ],
      ]);

    if (filterByStatus) {
      dataGrid.instance.filter(["status", "=", filterByStatus]);
    }
  }, [isMaturityVisible, dataGrid, filterByStatus, matureDays]);

  const maturingInDaysRenderer = (value: any) => {
    const maturityTime = getMaturityDate(value.data).getTime();
    const nowTime = new Date(Date.now()).getTime();
    const maturingInDays = Math.max(
      0,
      Math.floor((maturityTime - nowTime) / (24 * 60 * 60 * 1000))
    );
    return maturingInDays > 0 ? `${maturingInDays}` : "-";
  };

  const daysPastDueRenderer = (value: any) => {
    const maturityTime = getMaturityDate(value.data).getTime();
    const nowTime = new Date(Date.now()).getTime();
    const daysPastDue = Math.floor(
      (nowTime - maturityTime) / (24 * 60 * 60 * 1000)
    );
    return daysPastDue > 0 ? daysPastDue.toString() : "-";
  };

  const columns = useMemo(
    () => [
      {
        fixed: true,
        visible: !!actionItems && actionItems.length > 0,
        dataField: "action",
        caption: "Action",
        alignment: "center",
        width: 80,
        cellRender: (params: GridValueFormatterParams) => (
          <DataGridActionMenu params={params} actionItems={actionItems} />
        ),
      },
      {
        fixed: true,
        visible: isDisbursementIdentifierVisible,
        dataField: "disbursement_identifier",
        caption: "Disbursement Identifier",
        width: ColumnWidths.Identifier,
        cellRender: (params: GridValueFormatterParams) => (
          <LoanDrawerLauncher
            label={params.row.data.disbursement_identifier}
            loanId={params.row.data.id as string}
          />
        ),
      },
      {
        visible: isCompanyVisible,
        dataField: "company.name",
        caption: "Customer Name",
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: GridValueFormatterParams) =>
          handleClickCustomer ? (
            <ClickableDataGridCell
              label={params.row.data.company.name}
              onClick={() => handleClickCustomer(params.row.data.company.id)}
            />
          ) : (
            params.row.data.company?.name || "-"
          ),
      },
      {
        caption: "Loan Amount",
        dataField: "amount",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: GridValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.amount} />
        ),
      },
      {
        visible: !isMaturityVisible,
        caption: "Requested Payment Date",
        dataField: "requested_payment_date",
        width: ColumnWidths.Date,
        alignment: "right",
        cellRender: (params: GridValueFormatterParams) => (
          <DateDataGridCell
            dateString={params.row.data.requested_payment_date}
          />
        ),
      },
      {
        visible: isArtifactVisible,
        dataField: "artifact_name",
        caption: "Purchase Order / Invoice",
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: GridValueFormatterParams) =>
          params.row.data.purchase_order ? (
            <PurchaseOrderDrawerLauncher
              label={params.row.data.artifact_name}
              isMetrcBased={params.row.data.purchase_order.is_metrc_based}
              purchaseOrderId={params.row.data.purchase_order.id}
            />
          ) : params.row.data.invoice ? (
            <InvoiceDrawerLauncher
              label={params.row.data.artifact_name}
              invoiceId={params.row.data.invoice.id}
            />
          ) : params.row.data.line_of_credit ? (
            "N/A"
          ) : null,
      },
      {
        dataField: "vendor_name",
        caption: "Vendor Name",
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: GridValueFormatterParams) => (
          <TextDataGridCell label={params.row.data.vendor_name} />
        ),
      },
      {
        visible: isMaturityVisible,
        caption: "Origination Date",
        dataField: "origination_date",
        width: ColumnWidths.Date,
        alignment: "right",
        cellRender: (params: GridValueFormatterParams) => (
          <DateDataGridCell dateString={params.row.data.origination_date} />
        ),
      },
      {
        visible: isMaturityVisible,
        caption: "Maturity Date",
        dataField: "adjusted_maturity_date",
        width: ColumnWidths.Date,
        alignment: "right",
        cellRender: (params: GridValueFormatterParams) => (
          <DateDataGridCell
            dateString={params.row.data.adjusted_maturity_date}
          />
        ),
      },
      {
        visible: isMaturityVisible && !isDaysPastDueVisible,
        caption: "Maturing in (Days)",
        width: 100,
        alignment: "right",
        calculateCellValue: (row: any) => maturingInDaysRenderer({ data: row }),
      },
      {
        visible: isMaturityVisible && isDaysPastDueVisible,
        caption: "Days Past Due",
        width: 100,
        alignment: "right",
        calculateCellValue: (row: any) => daysPastDueRenderer({ data: row }),
      },
      {
        visible: isMaturityVisible,
        dataField: "outstanding_principal_balance",
        caption: "Outstanding Principal",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: GridValueFormatterParams) => (
          <CurrencyDataGridCell
            value={params.row.data.outstanding_principal_balance}
          />
        ),
      },
      {
        visible: isMaturityVisible,
        dataField: "outstanding_interest",
        caption: "Outstanding Interest",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: GridValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.outstanding_interest} />
        ),
      },
      {
        visible: isMaturityVisible,
        dataField: "outstanding_fees",
        caption: "Oustanding Fees",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: GridValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.outstanding_fees} />
        ),
      },
      {
        visible: isReportingVisible,
        dataField: "total_principal_paid",
        caption: "Total Principal Paid",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: GridValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.total_principal_paid} />
        ),
      },
      {
        visible: isReportingVisible,
        dataField: "total_interest_paid",
        caption: "Total Interest Paid",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: GridValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.total_interest_paid} />
        ),
      },
      {
        visible: isReportingVisible,
        dataField: "total_fees_paid",
        caption: "Total Fees Paid",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: GridValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.total_fees_paid} />
        ),
      },
    ],
    [
      isArtifactVisible,
      isCompanyVisible,
      isDaysPastDueVisible,
      isDisbursementIdentifierVisible,
      isMaturityVisible,
      isReportingVisible,
      actionItems,
      handleClickCustomer,
    ]
  );

  const handleSelectionChanged = useMemo(
    () =>
      ({ selectedRowsData }: any) =>
        handleSelectLoans &&
        handleSelectLoans(selectedRowsData as LoanFragment[]),
    [handleSelectLoans]
  );

  const allowedPageSizes = useMemo(() => [], []);
  const filtering = useMemo(
    () => ({ enable: isFilteringEnabled }),
    [isFilteringEnabled]
  );

  return (
    <ControlledDataGrid
      ref={(ref) => setDataGrid(ref)}
      isExcelExport={isExcelExport}
      isSortingDisabled={isSortingDisabled}
      filtering={filtering}
      pager={pager}
      select={isMultiSelectEnabled}
      pageSize={pageSize}
      allowedPageSizes={allowedPageSizes}
      dataSource={rows}
      columns={columns}
      selectedRowKeys={selectedLoanIds}
      onSelectionChanged={handleSelectionChanged}
    />
  );
}
