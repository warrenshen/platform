import { GridValueFormatterParams } from "@material-ui/data-grid";
import LoanDrawerLauncher from "components/Loan/LoanDrawerLauncher";
import LoanPaymentStatusChip from "components/Shared/Chip/LoanPaymentStatusChip";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import {
  Companies,
  DebtFacilityReportCompanyDetailsFragment,
  LoanFragment,
  Loans,
  OpenLoanForDebtFacilityFragment,
} from "generated/graphql";
import { parseDateStringServer, renderQuarter } from "lib/date";
import {
  anonymizeLoanNames,
  calculateGrossMarginValue,
  countAdvancesSent,
  determineBorrowerEligibility,
  determineIfPreviouslyAssigned,
  determineLoanEligibility,
  getArtifactDueDate,
  getCustomerIdentifier,
  getCustomerName,
  getDaysPastDue,
  getDaysPastDueBucket,
  getDebtFacilityAddedDate,
  getDebtFacilityStatus,
  getFinancingDayLimit,
  getFinancingPeriod,
  getInterestAfterEndDate,
  getLateFeesAfterEndDate,
  getLoanIdentifier,
  getLoanMonth,
  getLoanYear,
  getLoansInfoData,
  getMaturityDate,
  getOriginationOrCreatedDate,
  getProductTypeFromDebtFacilityFragment,
  getRepaymentDate,
  getUSState,
  getVendorName,
  reduceLineOfCreditLoans,
} from "lib/debtFacility";
import {
  LoanPaymentStatusEnum,
  LoanPaymentStatusToLabel,
  ProductTypeEnum,
  ProductTypeToLabel,
} from "lib/enum";
import { getLoanArtifactName } from "lib/loans";
import { CurrencyPrecision } from "lib/number";
import { ColumnWidths, formatRowModel } from "lib/tables";
import { groupBy } from "lodash";
import { useMemo } from "react";

interface Props {
  isAnonymized: boolean;
  loans: OpenLoanForDebtFacilityFragment[];
  loansInfoLookup: Record<string, Record<string, Record<string, string>>>;
  companyInfoLookup: Record<string, DebtFacilityReportCompanyDetailsFragment>;
  selectedLoanIds?: Loans["id"][];
  handleClickCustomer?: (customerId: Companies["id"]) => void;
  handleSelectLoans?: (loans: LoanFragment[]) => void;
  supportedProductTypes: ProductTypeEnum[];
  lastDebtFacilityReportDate: string;
  currentDebtFacilityReportDate: string;
}

function getRows(
  loans: OpenLoanForDebtFacilityFragment[],
  loansInfoLookup: Record<string, Record<string, Record<string, string>>>,
  companyInfoLookup: Record<string, DebtFacilityReportCompanyDetailsFragment>,
  supportedProductTypes: ProductTypeEnum[],
  lastDebtFacilityReportDate: string,
  isAnonymized: boolean,
  currentDebtFacilityReportDate: string
) {
  const filteredLoans = loans.filter((loan) => {
    return (
      (loansInfoLookup.hasOwnProperty(loan.company_id) &&
        loansInfoLookup[loan.company_id].hasOwnProperty(loan.id)) ||
      !!loan.closed_at
    );
  });
  const groupedLoans = groupBy(filteredLoans, (loan) => loan.company_id);
  const reducedLoans =
    Object.keys(groupedLoans).length !== 0
      ? reduceLineOfCreditLoans(groupedLoans, companyInfoLookup)
      : [];
  const { anonymizedCompanyLookup, anonymizedVendorLookup } =
    anonymizeLoanNames(reducedLoans, groupedLoans);

  return reducedLoans.map((loan) => {
    const productType = getProductTypeFromDebtFacilityFragment(
      companyInfoLookup[loan.company_id]
    );

    return formatRowModel({
      ...loan,
      artifact_name: getLoanArtifactName(loan),
      borrower_eligibility: determineBorrowerEligibility(
        loan,
        companyInfoLookup[loan.company_id],
        supportedProductTypes,
        productType
      ),
      customer_name: getCustomerName(
        companyInfoLookup[loan.company_id],
        isAnonymized,
        anonymizedCompanyLookup
      ),
      customer_identifier: getCustomerIdentifier({
        loan,
        companyInfo: companyInfoLookup[loan.company_id],
        productType,
        isAnonymized,
        anonymizedCompanyLookup,
      }),
      days_past_due: getDaysPastDue(
        loan,
        productType,
        currentDebtFacilityReportDate
      ),
      days_past_due_bucket: getDaysPastDueBucket(
        loan,
        productType,
        currentDebtFacilityReportDate
      ),
      debt_facility_added_date: getDebtFacilityAddedDate(loan),
      debt_facility_status: getDebtFacilityStatus(loan),
      disbursement_identifier: getLoanIdentifier({
        loan,
        productType,
        isAnonymized,
        anonymizedCompanyLookup,
      }),
      financing_day_limit: getFinancingDayLimit(loan, productType),
      financing_period: getFinancingPeriod(loan, productType),
      gmv_financed: calculateGrossMarginValue(loan, productType),
      interest_after_end_date: getInterestAfterEndDate(loan, loansInfoLookup),
      invoice_date: getOriginationOrCreatedDate(loan, productType),
      invoice_due_date: getArtifactDueDate(
        loan,
        companyInfoLookup[loan.company_id]
      ),
      late_fees_after_end_date: getLateFeesAfterEndDate(loan, loansInfoLookup),
      loan_count: countAdvancesSent(loan, productType),
      loan_eligibility: determineLoanEligibility(
        loan,
        companyInfoLookup[loan.company_id],
        supportedProductTypes,
        productType
      ),
      maturity_date: getMaturityDate(loan, productType),
      month: getLoanMonth(loan),
      origination_date: parseDateStringServer(loan.origination_date),
      outstanding_fees: getLoansInfoData(
        loan,
        productType,
        loansInfoLookup,
        "outstanding_late_fees",
        currentDebtFacilityReportDate
      ),
      outstanding_interest: getLoansInfoData(
        loan,
        productType,
        loansInfoLookup,
        "outstanding_interest",
        currentDebtFacilityReportDate
      ),
      outstanding_principal_balance: getLoansInfoData(
        loan,
        productType,
        loansInfoLookup,
        "outstanding_principal",
        currentDebtFacilityReportDate
      ),
      previously_assigned: determineIfPreviouslyAssigned(
        loan,
        lastDebtFacilityReportDate
      ),
      product_type: !!productType ? (productType as ProductTypeEnum) : null,
      quarter: renderQuarter(loan.origination_date),
      repayment_date: getRepaymentDate(loan, productType),
      total_interest_paid: getLoansInfoData(
        loan,
        productType,
        loansInfoLookup,
        "total_interest_paid",
        currentDebtFacilityReportDate,
        true
      ),
      total_late_fees_paid: getLoansInfoData(
        loan,
        productType,
        loansInfoLookup,
        "total_late_fees_paid",
        currentDebtFacilityReportDate,
        true
      ),
      total_principal_paid: getLoansInfoData(
        loan,
        productType,
        loansInfoLookup,
        "total_principal_paid",
        currentDebtFacilityReportDate,
        true
      ),
      us_state: getUSState(companyInfoLookup[loan.company_id]),
      vendor_name: getVendorName(
        loan,
        productType,
        isAnonymized,
        anonymizedVendorLookup
      ),
      year: getLoanYear(loan),
    });
  });
}

export default function DebtFacilityReportDataGrid({
  isAnonymized,
  loans,
  loansInfoLookup,
  companyInfoLookup,
  selectedLoanIds,
  handleClickCustomer,
  handleSelectLoans,
  supportedProductTypes,
  lastDebtFacilityReportDate,
  currentDebtFacilityReportDate,
}: Props) {
  const rows = useMemo(
    () =>
      getRows(
        loans,
        loansInfoLookup,
        companyInfoLookup,
        supportedProductTypes,
        lastDebtFacilityReportDate,
        isAnonymized,
        currentDebtFacilityReportDate
      ),
    [
      loans,
      loansInfoLookup,
      companyInfoLookup,
      supportedProductTypes,
      lastDebtFacilityReportDate,
      isAnonymized,
      currentDebtFacilityReportDate,
    ]
  );

  const columns = useMemo(
    () => [
      {
        fixed: true,
        dataField: "customer_name",
        caption: "Customer Name",
        minWidth: ColumnWidths.MinWidth,
        alignment: "left",
        cellRender: (params: GridValueFormatterParams) =>
          handleClickCustomer ? (
            <ClickableDataGridCell
              label={params.row.data.customer_name}
              onClick={() => handleClickCustomer(params.row.data.company.id)}
            />
          ) : (
            params.row.data.company?.name || "-"
          ),
      },
      {
        fixed: true,
        dataField: "customer_identifier",
        caption: "Customer Identifier",
        width: ColumnWidths.Identifier,
        alignment: "center",
        cellRender: (params: GridValueFormatterParams) => (
          <LoanDrawerLauncher
            label={params.row.data.customer_identifier}
            loanId={params.row.data.id as string}
          />
        ),
      },
      {
        fixed: true,
        dataField: "disbursement_identifier",
        caption: "Disbursement Identifier",
        width: ColumnWidths.Identifier,
        alignment: "center",
        cellRender: (params: GridValueFormatterParams) => (
          <LoanDrawerLauncher
            label={params.row.data.disbursement_identifier}
            loanId={params.row.data.id as string}
          />
        ),
      },
      {
        caption: "State",
        dataField: "us_state",
        width: ColumnWidths.Type,
        alignment: "left",
      },
      {
        caption: "Product Type",
        dataField: "product_type",
        width: ColumnWidths.Type,
        alignment: "left",
        lookup: {
          dataSource: {
            store: {
              type: "array",
              data: Object.values(ProductTypeEnum).map((productType) => ({
                product_type: productType,
                label: ProductTypeToLabel[productType],
              })),
              key: "product_type",
            },
          },
          valueExpr: "product_type",
          displayExpr: "label",
        },
      },
      {
        caption: "Added to Debt Facility Date",
        dataField: "debt_facility_added_date",
        format: "shortDate",
        width: ColumnWidths.Type,
        alignment: "right",
      },
      {
        caption: "Borrower Eligibility",
        dataField: "borrower_eligibility",
        width: ColumnWidths.Type,
        alignment: "left",
      },
      {
        caption: "Loan Eligibility",
        dataField: "loan_eligibility",
        width: ColumnWidths.Type,
        alignment: "left",
      },
      {
        caption: "Previously Assigned",
        dataField: "previously_assigned",
        width: ColumnWidths.Type,
        alignment: "center",
      },
      {
        dataField: "payment_status",
        caption: "Repayment Status",
        width: ColumnWidths.Status,
        alignment: "center",
        cellRender: (params: GridValueFormatterParams) => (
          <LoanPaymentStatusChip
            paymentStatus={
              params.row.data.payment_status as LoanPaymentStatusEnum
            }
          />
        ),
        lookup: {
          dataSource: {
            store: {
              type: "array",
              data: Object.values(LoanPaymentStatusEnum).map(
                (paymentStatus) => ({
                  payment_status: paymentStatus,
                  label: LoanPaymentStatusToLabel[paymentStatus],
                })
              ),
              key: "payment_status",
            },
          },
          valueExpr: "payment_status",
          displayExpr: "label",
        },
      },
      {
        dataField: "vendor_name",
        caption: `Vendor Name`,
        minWidth: ColumnWidths.MinWidth,
        alignment: "left",
      },
      {
        caption: "Invoice or PO Date",
        dataField: "invoice_date",
        format: "shortDate",
        width: ColumnWidths.Type,
        alignment: "right",
      },
      {
        caption: "Invoice or PO Due Date",
        dataField: "invoice_due_date",
        format: "shortDate",
        width: ColumnWidths.Type,
        alignment: "right",
      },
      {
        caption: "Origination Date",
        dataField: "origination_date",
        format: "shortDate",
        width: ColumnWidths.Date,
        alignment: "right",
      },
      {
        caption: "Maturity Date",
        dataField: "maturity_date",
        format: "shortDate",
        width: ColumnWidths.Date,
        alignment: "right",
      },
      {
        caption: "GMV Financed",
        dataField: "gmv_financed",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Type,
        alignment: "right",
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
        dataField: "outstanding_interest",
        caption: "Outstanding Interest",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "outstanding_fees",
        caption: "Oustanding Late Fees",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        caption: "Repayment Date",
        dataField: "repayment_date",
        format: "shortDate",
        width: ColumnWidths.Date,
        alignment: "right",
      },
      {
        dataField: "outstanding_principal_balance",
        caption: "Outstanding Principal",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "total_principal_paid",
        caption: "Total Principal Paid",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "total_interest_paid",
        caption: "Total Interest Paid",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "total_late_fees_paid",
        caption: "Total Late Fees Paid",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "financing_period",
        caption: "Financing Period",
        width: ColumnWidths.Currency,
        alignment: "left",
      },
      {
        dataField: "financing_day_limit",
        caption: "Financing Day Limit",
        width: ColumnWidths.Currency,
        alignment: "left",
      },
      {
        dataField: "days_past_due",
        caption: "Days Past Due",
        width: 100,
        alignment: "left",
      },
      {
        caption: "DPD Bucket",
        dataField: "days_past_due_bucket",
        width: 100,
        alignment: "left",
      },
      {
        dataField: "month",
        caption: "Month",
        width: 100,
        alignment: "left",
      },
      {
        dataField: "year",
        caption: "Year",
        width: 100,
        alignment: "left",
      },
      {
        dataField: "quarter",
        caption: "Quarter",
        width: 100,
        alignment: "left",
      },
      {
        caption: "Loan Count",
        dataField: "loan_count",
        width: ColumnWidths.Type,
        alignment: "left",
      },
      {
        dataField: "interest_after_end_date",
        caption: "Interest After End Date",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "late_fees_after_end_date",
        caption: "Late Fees After End Date",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
    ],
    [handleClickCustomer]
  );

  const handleSelectionChanged = useMemo(
    () =>
      ({ selectedRowsData }: any) =>
        handleSelectLoans &&
        handleSelectLoans(selectedRowsData as LoanFragment[]),
    [handleSelectLoans]
  );

  return (
    <ControlledDataGrid
      isExcelExport
      pager
      select
      filtering={{ enable: true }}
      dataSource={rows}
      columns={columns}
      selectedRowKeys={selectedLoanIds}
      onSelectionChanged={handleSelectionChanged}
    />
  );
}
