import { Box, Button, Typography } from "@material-ui/core";
import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import CommentIcon from "@material-ui/icons/Comment";
import InvoiceDrawerLauncher from "components/Invoices/InvoiceDrawerLauncher";
import LoanDrawerLauncher from "components/Loan/LoanDrawerLauncher";
import PurchaseOrderDrawerLauncher from "components/PurchaseOrder/PurchaseOrderDrawerLauncher";
import DebtFacilityStatusChip from "components/Shared/Chip/DebtFacilityStatusChip";
import LoanPaymentStatusChip from "components/Shared/Chip/LoanPaymentStatusChip";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
import TextDataGridCell from "components/Shared/DataGrid/TextDataGridCell";
import {
  Companies,
  LoanArtifactFragment,
  LoanTypeEnum,
  Loans,
  OpenLoanForDebtFacilityFragment,
  PurchaseOrders,
  RequestStatusEnum,
} from "generated/graphql";
import { parseDateStringServer, withinNDaysOfNowOrBefore } from "lib/date";
import { determineLoanEligibility } from "lib/debtFacility";
import {
  DebtFacilityCompanyStatusEnum,
  DebtFacilityCompanyStatusToEligibility,
  DebtFacilityStatusEnum,
  LoanPaymentStatusEnum,
  LoanTypeToLabel,
  ProductTypeEnum,
  ProductTypeToLabel,
} from "lib/enum";
import { PartnerEnum } from "lib/enum";
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
  isEligibilityVisible?: boolean;
  isDebtFacilityVisible?: boolean;
  partnerType?: PartnerEnum;
  pager?: boolean;
  pageSize?: number;
  filterByStatus?: RequestStatusEnum;
  loans: OpenLoanForDebtFacilityFragment[];
  selectedLoanIds?: Loans["id"][];
  handleClickCustomer?: (customerId: Companies["id"]) => void;
  handleClickPurchaseOrderBankNote?: (
    purchaseOrderId: PurchaseOrders["id"]
  ) => void;
  handleSelectLoans?: (loans: OpenLoanForDebtFacilityFragment[]) => void;
  supportedProductTypes?: ProductTypeEnum[];
}

function getRows(
  loans: OpenLoanForDebtFacilityFragment[],
  supportedProductTypes: ProductTypeEnum[]
): RowsProp {
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
    debt_facility_status: !!loan.loan_report
      ? loan.loan_report.debt_facility_status
      : null,
    repayment_date: !!loan.loan_report ? loan.loan_report.repayment_date : null,
    financing_period: !!loan.loan_report
      ? loan.loan_report.financing_period
      : null,
    financing_day_limit: !!loan.loan_report
      ? loan.loan_report.financing_day_limit
      : null,
    product_type: !!loan.company?.contract?.product_type
      ? ProductTypeToLabel[
          loan.company.contract.product_type as ProductTypeEnum
        ]
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
    borrower_eligibility: !!loan.company?.debt_facility_status
      ? DebtFacilityCompanyStatusToEligibility[
          loan.company.debt_facility_status as DebtFacilityCompanyStatusEnum
        ]
      : null,
    loan_eligibility: determineLoanEligibility(loan, supportedProductTypes),
    debt_facility: !!loan.loan_report?.debt_facility
      ? loan.loan_report?.debt_facility.name
      : "-",
    debt_facility_added_date: !!loan.loan_report?.debt_facility_added_date
      ? loan.loan_report.debt_facility_added_date
      : "",
    new_on_balance_sheet:
      !!loan.origination_date &&
      withinNDaysOfNowOrBefore(loan.origination_date, 30, true) === true
        ? "Yes"
        : "No",
  }));
}

const getMaturityDate = (rowData: any) => {
  return parseDateStringServer(rowData.adjusted_maturity_date);
};

export default function DebtFacilityLoansDataGrid({
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
  isEligibilityVisible = false,
  isDebtFacilityVisible = false,
  pager = true,
  pageSize = 10,
  partnerType = PartnerEnum.VENDOR,
  filterByStatus,
  loans,
  selectedLoanIds,
  handleClickCustomer,
  handleClickPurchaseOrderBankNote,
  handleSelectLoans,
  supportedProductTypes = [] as ProductTypeEnum[],
}: Props) {
  const [dataGrid, setDataGrid] = useState<any>(null);
  const rows = useMemo(
    () => getRows(loans, supportedProductTypes),
    [loans, supportedProductTypes]
  );

  useEffect(() => {
    if (!dataGrid) {
      return;
    }

    dataGrid.instance.clearFilter(getMaturityDate);

    if (filterByStatus) {
      dataGrid.instance.filter(["status", "=", filterByStatus]);
    }
  }, [isMaturityVisible, dataGrid, filterByStatus]);

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
        visible: isStatusVisible && isMaturityVisible,
        dataField: "debt_facility_status",
        caption: "Debt Facility Status",
        width: ColumnWidths.Status,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) => (
          <DebtFacilityStatusChip
            debtFacilityStatus={
              params.row.data.debt_facility_status as DebtFacilityStatusEnum
            }
          />
        ),
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
        visible: isCompanyVisible,
        dataField: "product_type",
        caption: "Product Type",
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: ValueFormatterParams) => (
          <TextDataGridCell label={params.row.data.product_type} />
        ),
      },
      {
        visible: isEligibilityVisible,
        caption: "Borrower Eligibility",
        dataField: "borrower_eligibility",
        width: ColumnWidths.Type,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) => (
          <TextDataGridCell label={params.row.data.borrower_eligibility} />
        ),
      },
      {
        visible: isDebtFacilityVisible,
        caption: "Debt Facility",
        dataField: "debt_facility",
        width: ColumnWidths.Type,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) => (
          <TextDataGridCell label={params.row.data.debt_facility} />
        ),
      },
      {
        visible: isDebtFacilityVisible,
        caption: "Assigned to Debt Facility Date",
        dataField: "debt_facility_added_date",
        width: ColumnWidths.Type,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell
            dateString={params.row.data.debt_facility_added_date}
          />
        ),
      },
      {
        visible: isEligibilityVisible,
        caption: "Loan Eligibility",
        dataField: "previously_eligible",
        width: ColumnWidths.Type,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) => (
          <TextDataGridCell label={params.row.data.loan_eligibility} />
        ),
      },
      {
        visible: isEligibilityVisible,
        caption: "New to Balance Sheet",
        dataField: "new_on_balance_sheet",
        width: ColumnWidths.Type,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) => (
          <TextDataGridCell label={params.row.data.new_on_balance_sheet} />
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
        cellRender: (params: ValueFormatterParams) =>
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
        caption: `${partnerType} Name`,
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: ValueFormatterParams) => (
          <TextDataGridCell label={params.row.data.vendor_name} />
        ),
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
                {!!params.row.data.bank_note && (
                  <Box ml={1}>
                    <Typography variant="body2">
                      {params.row.data.bank_note}
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
      {
        visible: isReportingVisible,
        caption: "Repayment Date",
        dataField: "repayment_date",
        width: ColumnWidths.Date,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell dateString={params.row.data.repayment_date} />
        ),
      },
      {
        visible: isReportingVisible,
        dataField: "financing_period",
        caption: "Financing Period",
        width: ColumnWidths.Currency,
      },
      {
        visible: isReportingVisible,
        dataField: "financing_day_limit",
        caption: "Financing Day Limit",
        width: ColumnWidths.Currency,
      },
      {
        visible: isReportingVisible,
        dataField: "total_principal_paid",
        caption: "Total Principal Paid",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.total_principal_paid} />
        ),
      },
      {
        visible: isReportingVisible,
        dataField: "total_interest_paid",
        caption: "Total Interest Paid",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.total_interest_paid} />
        ),
      },
      {
        visible: isReportingVisible,
        dataField: "total_fees_paid",
        caption: "Total Fees Paid",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.total_fees_paid} />
        ),
      },
    ],
    [
      isArtifactVisible,
      isArtifactBankNoteVisible,
      isCompanyVisible,
      isDaysPastDueVisible,
      isDebtFacilityVisible,
      isDisbursementIdentifierVisible,
      isEligibilityVisible,
      isMaturityVisible,
      isReportingVisible,
      isStatusVisible,
      partnerType,
      handleClickCustomer,
      handleClickPurchaseOrderBankNote,
    ]
  );

  const handleSelectionChanged = useMemo(
    () =>
      ({ selectedRowsData }: any) =>
        handleSelectLoans &&
        handleSelectLoans(
          selectedRowsData as OpenLoanForDebtFacilityFragment[]
        ),
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
