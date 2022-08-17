import { Box, Button, Typography } from "@material-ui/core";
import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import CommentIcon from "@material-ui/icons/Comment";
import InvoiceDrawer from "components/Invoices/InvoiceDrawer";
import LoanDrawerLauncher from "components/Loan/LoanDrawerLauncher";
import PurchaseOrderDrawer from "components/PurchaseOrder/PurchaseOrderDrawer";
import LoanPaymentStatusChip from "components/Shared/Chip/LoanPaymentStatusChip";
import LoanStatusChip from "components/Shared/Chip/LoanStatusChip";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import DataGridActionMenu, {
  DataGridActionItem,
} from "components/Shared/DataGrid/DataGridActionMenu";
import PurchaseOrderIdentifierDataGridCell from "components/Shared/DataGrid/PurchaseOrderIdentifierDataGridCell";
import {
  Companies,
  Invoices,
  LoanArtifactFragment,
  LoanArtifactLimitedFragment,
  LoanFragment,
  LoanReportFragment,
  Loans,
  Maybe,
  PurchaseOrders,
  RequestStatusEnum,
} from "generated/graphql";
import { parseDateStringServer } from "lib/date";
import {
  AllLoanStatuses,
  DebtFacilityCompanyStatusEnum,
  DebtFacilityCompanyStatusToLabel,
  LoanPaymentStatusEnum,
  LoanStatusEnum,
  LoanStatusToLabel,
  PartnerEnum,
} from "lib/enum";
import {
  createLoanCustomerIdentifier,
  createLoanDisbursementIdentifier,
  getDaysPastDue,
  getDaysUntilMaturity,
  getLoanArtifactName,
  getLoanVendorName,
} from "lib/loans";
import { CurrencyPrecision } from "lib/number";
import { ColumnWidths, formatRowModel, truncateString } from "lib/tables";
import { useEffect, useMemo, useState } from "react";

type Loan = LoanFragment & (LoanArtifactFragment | LoanArtifactLimitedFragment);

interface Props {
  isArtifactVisible?: boolean;
  isArtifactBankNoteVisible?: boolean;
  isCompanyVisible?: boolean;
  isDebtFacilityStatusVisible?: boolean;
  isDaysPastDueVisible?: boolean;
  isDisbursementIdentifierVisible?: boolean;
  isExcelExport?: boolean;
  isFilteringEnabled?: boolean;
  isMaturityVisible?: boolean;
  isMultiSelectEnabled?: boolean;
  isReportingVisible?: boolean;
  isSortingDisabled?: boolean;
  isStatusVisible?: boolean;
  partnerType?: PartnerEnum;
  pager?: boolean;
  matureDays?: number;
  pageSize?: number;
  filterByStatus?: RequestStatusEnum;
  loans: Loan[];
  actionItems?: DataGridActionItem[];
  selectedLoanIds?: Loans["id"][];
  handleClickCustomer?: (customerId: Companies["id"]) => void;
  handleClickPurchaseOrderBankNote?: (
    purchaseOrderId: PurchaseOrders["id"]
  ) => void;
  handleSelectLoans?: (loans: LoanFragment[]) => void;
}

function getRows(
  loans: (LoanFragment & {
    loan_report?: Maybe<LoanReportFragment>;
  } & (LoanArtifactFragment | LoanArtifactLimitedFragment))[]
): RowsProp {
  return loans.map((loan) => {
    return formatRowModel({
      ...loan,
      adjusted_maturity_date: !!loan?.adjusted_maturity_date
        ? parseDateStringServer(loan.adjusted_maturity_date)
        : null,
      artifact_bank_note: loan.purchase_order
        ? truncateString(
            (loan as LoanArtifactFragment).purchase_order?.bank_note || ""
          )
        : "N/A",
      artifact_name: getLoanArtifactName(loan),
      customer_identifier: createLoanCustomerIdentifier(loan),
      days_past_due: getDaysPastDue(loan),
      disbursement_identifier: createLoanDisbursementIdentifier(loan),
      financing_day_limit: !!loan.loan_report
        ? loan.loan_report.financing_day_limit
        : null,
      maturing_in_days: getDaysUntilMaturity(loan),
      origination_date: !!loan?.origination_date
        ? parseDateStringServer(loan.origination_date)
        : null,
      repayment_date: !!loan.loan_report?.repayment_date
        ? parseDateStringServer(loan.loan_report.repayment_date)
        : null,
      requested_payment_date: !!loan?.requested_payment_date
        ? parseDateStringServer(loan.requested_payment_date)
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
      vendor_name: getLoanVendorName(loan),
    });
  });
}

const getMaturityDate = (rowData: any) => {
  return parseDateStringServer(rowData.adjusted_maturity_date);
};

export default function LoansDataGrid({
  isArtifactVisible = false,
  isArtifactBankNoteVisible = false,
  isCompanyVisible = false,
  isDebtFacilityStatusVisible = false,
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
  partnerType = PartnerEnum.VENDOR,
  filterByStatus,
  loans,
  actionItems,
  selectedLoanIds,
  handleClickCustomer,
  handleClickPurchaseOrderBankNote,
  handleSelectLoans,
}: Props) {
  const [dataGrid, setDataGrid] = useState<any>(null);
  const rows = useMemo(() => getRows(loans), [loans]);

  const [selectedPurchaseOrderId, setSelectedPurchaseOrderId] =
    useState<PurchaseOrders["id"]>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] =
    useState<Invoices["id"]>(null);

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
                label: LoanStatusToLabel[d],
              })),
              key: "status",
            },
          },
          valueExpr: "status",
          displayExpr: "label",
        },
      },
      {
        visible: isStatusVisible && isMaturityVisible,
        dataField: "payment_status",
        caption: "Repayment Status",
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
        visible: isDebtFacilityStatusVisible,
        dataField: "company.debt_facility_status",
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
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        visible: !isMaturityVisible,
        caption: "Requested Payment Date",
        dataField: "requested_payment_date",
        format: "shortDate",
        width: ColumnWidths.Date,
        alignment: "right",
      },
      {
        visible: isArtifactVisible,
        dataField: "artifact_name",
        caption: "Purchase Order / Invoice",
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: ValueFormatterParams) =>
          params.row.data.purchase_order ? (
            <PurchaseOrderIdentifierDataGridCell
              onClick={() => {
                setSelectedPurchaseOrderId(params.row.data.purchase_order.id);
              }}
              artifactName={params.row.data.artifact_name}
              isMetrcBased={params.row.data.purchase_order.is_metrc_based}
            />
          ) : params.row.data.invoice ? (
            <ClickableDataGridCell
              onClick={() => {
                setSelectedInvoiceId(params.row.data.invoice.id);
              }}
              label={params.row.data.artifact_name}
            />
          ) : params.row.data.line_of_credit ? (
            "N/A"
          ) : null,
      },
      {
        dataField: "vendor_name",
        caption: `${partnerType} Name`,
        minWidth: ColumnWidths.MinWidth,
      },
      {
        visible: isArtifactBankNoteVisible,
        dataField: "artifact_bank_note",
        caption: "PO Bank Note",
        width: 340,
        cellRender: (params: ValueFormatterParams) =>
          params.row.data.artifact_bank_note !== "N/A" ? (
            <Button
              color="default"
              variant="text"
              style={{
                minWidth: 0,
                textAlign: "left",
              }}
              onClick={() =>
                !!handleClickPurchaseOrderBankNote &&
                handleClickPurchaseOrderBankNote(params.row.data.artifact_id)
              }
            >
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
            </Button>
          ) : (
            params.row.data.artifact_bank_note
          ),
      },
      {
        visible: isMaturityVisible,
        caption: "Origination Date",
        dataField: "origination_date",
        format: "shortDate",
        width: ColumnWidths.Date,
        alignment: "right",
      },
      {
        visible: isMaturityVisible,
        caption: "Maturity Date",
        dataField: "adjusted_maturity_date",
        width: ColumnWidths.Date,
        alignment: "right",
      },
      {
        visible: isMaturityVisible && !isDaysPastDueVisible,
        caption: "Maturing in (Days)",
        dataField: "maturing_in_days",
        width: 100,
        alignment: "right",
      },
      {
        visible: isMaturityVisible && isDaysPastDueVisible,
        caption: "Days Past Due",
        dataField: "days_past_due",
        width: 100,
        alignment: "right",
      },
      {
        visible: isMaturityVisible,
        caption: "Outstanding Principal",
        dataField: "outstanding_principal_balance",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        visible: isMaturityVisible,
        caption: "Outstanding Interest",
        dataField: "outstanding_interest",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        visible: isMaturityVisible,
        caption: "Outstanding Late Fees",
        dataField: "outstanding_fees",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        visible: isReportingVisible,
        caption: "Repayment Date",
        dataField: "repayment_date",
        format: "shortDate",
        width: ColumnWidths.Date,
        alignment: "right",
      },
      {
        visible: isReportingVisible,
        dataField: "financing_day_limit",
        caption: "Financing Day Limit",
        width: ColumnWidths.Currency,
      },
      {
        visible: isReportingVisible,
        caption: "Total Principal Paid",
        dataField: "total_principal_paid",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        visible: isReportingVisible,
        caption: "Total Interest Paid",
        dataField: "total_interest_paid",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        visible: isReportingVisible,
        caption: "Total Late Fees Paid",
        dataField: "total_fees_paid",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
    ],
    [
      isArtifactVisible,
      isArtifactBankNoteVisible,
      isCompanyVisible,
      isDebtFacilityStatusVisible,
      isDaysPastDueVisible,
      isDisbursementIdentifierVisible,
      isMaturityVisible,
      isReportingVisible,
      isStatusVisible,
      actionItems,
      partnerType,
      handleClickCustomer,
      handleClickPurchaseOrderBankNote,
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
    <>
      {!!selectedPurchaseOrderId && (
        <PurchaseOrderDrawer
          purchaseOrderId={selectedPurchaseOrderId}
          handleClose={() => setSelectedPurchaseOrderId(null)}
        />
      )}
      {!!selectedInvoiceId && (
        <InvoiceDrawer
          invoiceId={selectedInvoiceId}
          handleClose={() => setSelectedInvoiceId(null)}
        />
      )}
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
    </>
  );
}
