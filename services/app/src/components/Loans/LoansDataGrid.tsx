import { Box, Typography } from "@material-ui/core";
import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import InvoiceDrawerLauncher from "components/Invoices/InvoiceDrawerLauncher";
import LoanDrawerLauncher from "components/Loan/LoanDrawerLauncher";
import PurchaseOrderDrawerLauncher from "components/PurchaseOrder/PurchaseOrderDrawerLauncher";
import LoanPaymentStatusChip from "components/Shared/Chip/LoanPaymentStatusChip";
import LoanStatusChip from "components/Shared/Chip/LoanStatusChip";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import DataGridActionMenu, {
  DataGridActionItem,
} from "components/Shared/DataGrid/DataGridActionMenu";
import CommentIcon from "@material-ui/icons/Comment";
import UpdatePurchaseOrderBankNote from "components/PurchaseOrder/UpdatePurchaseOrderBankNote";
import ModalButton from "components/Shared/Modal/ModalButton";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
import {
  Companies,
  LoanArtifactFragment,
  LoanArtifactLimitedFragment,
  LoanFragment,
  Loans,
  LoanStatusEnum,
  LoanTypeEnum,
  RequestStatusEnum,
} from "generated/graphql";
import {
  AllLoanStatuses,
  LoanPaymentStatusEnum,
  LoanTypeToLabel,
} from "lib/enum";
import {
  createLoanCustomerIdentifier,
  createLoanDisbursementIdentifier,
} from "lib/loans";
import { ColumnWidths, truncateString } from "lib/tables";
import { useEffect, useMemo, useState } from "react";

interface Props {
  isArtifactVisible?: boolean;
  isCompanyVisible?: boolean;
  isDisbursementIdentifierVisible?: boolean;
  isExcelExport?: boolean;
  isDaysPastDueVisible?: boolean;
  isFilteringEnabled?: boolean;
  isMaturityVisible?: boolean;
  isMultiSelectEnabled?: boolean;
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
  loans: (LoanFragment & (LoanArtifactFragment | LoanArtifactLimitedFragment))[]
): RowsProp {
  return loans.map((loan) => ({
    ...loan,
    customer_identifier: createLoanCustomerIdentifier(loan),
    disbursement_identifier: createLoanDisbursementIdentifier(loan),
    artifact_name: loan.purchase_order
      ? loan.purchase_order.order_number
      : loan.invoice
      ? loan.invoice.invoice_number
      : "N/A",
    artifact_bank_note: loan.purchase_order
      ? truncateString(
          (loan as LoanArtifactFragment).purchase_order?.bank_note || ""
        )
      : "N/A",
    vendor_name: loan.purchase_order
      ? loan.purchase_order.vendor?.name
      : loan.line_of_credit
      ? loan.line_of_credit.recipient_vendor?.name
      : "N/A",
  }));
}

const getMaturityDate = (rowData: any) =>
  new Date(rowData.adjusted_maturity_date);

export default function LoansDataGrid({
  isArtifactVisible = false,
  isCompanyVisible = false,
  isDaysPastDueVisible = false,
  isDisbursementIdentifierVisible = false,
  isExcelExport = true,
  isFilteringEnabled = false,
  isMaturityVisible = false,
  isMultiSelectEnabled = false,
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
        cellRender: (params: ValueFormatterParams) => (
          <DataGridActionMenu params={params} actionItems={actionItems} />
        ),
      },
      {
        fixed: true,
        dataField: "customer_identifier",
        caption: "Customer Identifier",
        width: ColumnWidths.Identifier,
        cellRender: (params: ValueFormatterParams) => (
          <LoanDrawerLauncher
            label={params.row.data.customer_identifier}
            loanId={params.row.data.id as string}
          />
        ),
      },
      {
        fixed: true,
        visible: isDisbursementIdentifierVisible,
        dataField: "disbursement_identifier",
        caption: "Disbursement Identifier",
        width: ColumnWidths.Identifier,
        cellRender: (params: ValueFormatterParams) => (
          <LoanDrawerLauncher
            label={params.row.data.disbursement_identifier}
            loanId={params.row.data.id as string}
          />
        ),
      },
      {
        visible: isStatusVisible && !isMaturityVisible,
        dataField: "status",
        caption: "Approval Status",
        width: ColumnWidths.Status,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) => (
          <LoanStatusChip loanStatus={params.value as LoanStatusEnum} />
        ),
        lookup: {
          dataSource: {
            store: {
              type: "array",
              data: AllLoanStatuses.map((d) => ({
                status: d,
              })),
              key: "status",
            },
          },
          valueExpr: "status",
          displayExpr: "status",
        },
      },
      {
        visible: isStatusVisible && isMaturityVisible,
        dataField: "payment_status",
        caption: "Payment Status",
        width: ColumnWidths.Status,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) => (
          <LoanPaymentStatusChip
            paymentStatus={
              params.row.data.payment_status as LoanPaymentStatusEnum
            }
          />
        ),
      },
      {
        visible: isCompanyVisible,
        dataField: "company.name",
        caption: "Customer Name",
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: ValueFormatterParams) =>
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
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.amount} />
        ),
      },
      {
        visible: !isMaturityVisible,
        caption: "Requested Payment Date",
        dataField: "requested_payment_date",
        width: ColumnWidths.Date,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell
            dateString={params.row.data.requested_payment_date}
          />
        ),
      },
      {
        // Temporarily hide this column. Consider a
        // tool-tip UX to surface this information.
        visible: false,
        caption: "Loan Type",
        dataField: "loan_type",
        width: ColumnWidths.Type,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) => (
          <Box>
            {LoanTypeToLabel[params.row.data.loan_type as LoanTypeEnum]}
          </Box>
        ),
      },
      {
        visible: isArtifactVisible,
        dataField: "artifact_name",
        caption: "Purchase Order / Invoice",
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: ValueFormatterParams) => (
          <Box display="flex" alignItems="center">
            {params.row.data.purchase_order && (
              <PurchaseOrderDrawerLauncher
                label={params.row.data.artifact_name as string}
                purchaseOrderId={params.row.data.purchase_order.id as string}
              />
            )}
            {params.row.data.invoice && (
              <InvoiceDrawerLauncher
                label={params.row.data.artifact_name as string}
                invoiceId={params.row.data.invoice.id as string}
              />
            )}
            {params.row.data.line_of_credit && "N/A"}
          </Box>
        ),
      },
      {
        dataField: "vendor_name",
        caption: "Vendor Name",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        visible: isArtifactVisible,
        dataField: "artifact_bank_note",
        caption: "PO Bank Note",
        width: 340,
        cellRender: (params: ValueFormatterParams) =>
          params.row.data.artifact_bank_note !== "N/A" ? (
            <ModalButton
              label={
                <Box display="flex" alignItems="center">
                  <CommentIcon />
                  {!!params.row.data.artifact_bank_note && (
                    <Box ml={1}>
                      <Typography variant="body2">
                        {params.row.data.artifact_bank_note}
                      </Typography>
                    </Box>
                  )}
                </Box>
              }
              color="default"
              textAlign="left"
              variant="text"
              modal={({ handleClose }) => (
                <UpdatePurchaseOrderBankNote
                  purchaseOrderId={params.row.data.artifact_id}
                  handleClose={handleClose}
                />
              )}
            />
          ) : (
            params.row.data.artifact_bank_note
          ),
      },
      {
        visible: isMaturityVisible,
        caption: "Origination Date",
        dataField: "origination_date",
        width: ColumnWidths.Date,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell dateString={params.row.data.origination_date} />
        ),
      },
      {
        visible: isMaturityVisible,
        caption: "Maturity Date",
        dataField: "adjusted_maturity_date",
        width: ColumnWidths.Date,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
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
        cellRender: (params: ValueFormatterParams) => (
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
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.outstanding_interest} />
        ),
      },
      {
        visible: isMaturityVisible,
        dataField: "outstanding_fees",
        caption: "Oustanding Fees",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.outstanding_fees} />
        ),
      },
    ],
    [
      isArtifactVisible,
      isCompanyVisible,
      isDaysPastDueVisible,
      isDisbursementIdentifierVisible,
      isMaturityVisible,
      isStatusVisible,
      actionItems,
      handleClickCustomer,
    ]
  );

  const handleSelectionChanged = useMemo(
    () => ({ selectedRowsData }: any) =>
      handleSelectLoans &&
      handleSelectLoans(selectedRowsData as LoanFragment[]),
    [handleSelectLoans]
  );

  const allowedPageSizes = useMemo(() => [], []);
  const filtering = useMemo(() => ({ enable: isFilteringEnabled }), [
    isFilteringEnabled,
  ]);

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
