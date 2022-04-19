import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import LoanDrawerLauncher from "components/Loan/LoanDrawerLauncher";
import LoanPaymentStatusChip from "components/Shared/Chip/LoanPaymentStatusChip";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import TextDataGridCell from "components/Shared/DataGrid/TextDataGridCell";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
import {
  Companies,
  LoanArtifactFragment,
  LoanFragment,
  Loans,
  LoanTypeEnum,
  OpenLoanForDebtFacilityFragment,
  PurchaseOrders,
  RequestStatusEnum,
} from "generated/graphql";
import { formatDateString, formatDatetimeString } from "lib/date";
import {
  LoanPaymentStatusEnum,
  LoanStatusEnum,
  PartnerEnum,
  ProductTypeEnum,
  ProductTypeToLabel,
} from "lib/enum";
import {
  createLoanCustomerIdentifier,
  createLoanDisbursementIdentifier,
  getLoanArtifactName,
  getLoanVendorName,
} from "lib/loans";
import {
  determineBorrowerEligibility,
  determineLoanEligibility,
  getProductTypeFromOpenLoanForDebtFacilityFragment,
} from "lib/debtFacility";
import { ColumnWidths, truncateString } from "lib/tables";
import { groupBy } from "lodash";
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
  handleSelectLoans?: (loans: LoanFragment[]) => void;
  supportedProductTypes: ProductTypeEnum[];
  lastDebtFacilityReportDate: string;
  isAnonymized: boolean;
}

const getOriginationOrCreatedDate = (loan: OpenLoanForDebtFacilityFragment) => {
  if (
    !!loan.purchase_order?.purchase_order_metrc_transfers[0]?.metrc_transfer
      ?.created_date
  ) {
    return formatDatetimeString(
      loan.purchase_order?.purchase_order_metrc_transfers[0]?.metrc_transfer
        ?.created_date,
      false // isTimeVisible
    );
  } else {
    return formatDateString(loan.origination_date);
  }
};

const calculateGrossMarginValue = (loan: OpenLoanForDebtFacilityFragment) => {
  const productType = getProductTypeFromOpenLoanForDebtFacilityFragment(loan);
  // NOTE(JR): the finance team would eventually like this to be configurable
  const grossMarginMultiplier =
    productType === ProductTypeEnum.InvoiceFinancing ? 2.0 : 1.5;

  return loan.amount * grossMarginMultiplier;
};

const countAdvancesSent = (loan: OpenLoanForDebtFacilityFragment) => {
  if (!!loan.transactions && !!loan?.company?.contract?.product_type) {
    const productType = getProductTypeFromOpenLoanForDebtFacilityFragment(loan);
    if (productType === ProductTypeEnum.LineOfCredit) {
      return loan.transactions.length;
    } else {
      let purchaseOrderCount = !!loan.purchase_order ? 1 : 0;
      let invoiceCount = !!loan.invoice ? 1 : 0;

      return purchaseOrderCount + invoiceCount;
    }
  }
};

const determineIfPreviouslyAssigned = (
  loan: OpenLoanForDebtFacilityFragment,
  lastDebtFacilityReportDate: string
) => {
  return !!loan.loan_report?.debt_facility_added_date
    ? new Date(loan.loan_report?.debt_facility_added_date) <
        new Date(lastDebtFacilityReportDate)
    : false;
};

const reduceLineOfCreditLoans = (
  groupedByCompanyIds: Record<string, OpenLoanForDebtFacilityFragment[]>
) => {
  return Object.entries(groupedByCompanyIds)
    .map(([company_id, loans]) => {
      const isLineOfCredit =
        loans[0]["loan_type"] === LoanTypeEnum.LineOfCredit;
      if (isLineOfCredit) {
        return [
          loans
            .filter((loan) => {
              return loan["closed_at"] === null;
            })
            .reduce((a, b) => {
              return {
                ...a,
                amount: a.amount + b.amount,
                outstanding_fees: a.outstanding_fees + b.outstanding_fees,
                outstanding_interest:
                  a.outstanding_interest + b.outstanding_interest,
                outstanding_principal_balance:
                  a.outstanding_principal_balance +
                  b.outstanding_principal_balance,
                payment_status:
                  a.payment_status === LoanPaymentStatusEnum.PARTIALLY_PAID ||
                  b.payment_status === LoanPaymentStatusEnum.PARTIALLY_PAID
                    ? LoanPaymentStatusEnum.PARTIALLY_PAID
                    : LoanStatusEnum.Funded,
                transactions: a["transactions"].concat(b["transactions"]),
              } as OpenLoanForDebtFacilityFragment;
            }),
        ];
      } else {
        return loans;
      }
    })
    .reduce((a, b) => {
      return a.concat(b);
    });
};

const getPartnerId = (loan: OpenLoanForDebtFacilityFragment) => {
  const line_of_credit_vendor_id =
    loan?.line_of_credit?.recipient_vendor_id || null;
  const vendor_id = loan?.purchase_order?.vendor_id || null;
  const payor_id = loan?.invoice?.payor_id || null;

  return !!line_of_credit_vendor_id
    ? line_of_credit_vendor_id
    : !!vendor_id
    ? vendor_id
    : !!payor_id
    ? payor_id
    : "None";
};

const anonymizeLoanNames = (
  loans: OpenLoanForDebtFacilityFragment[],
  groupedByCompanyIds: Record<string, OpenLoanForDebtFacilityFragment[]>
) => {
  const groupedByPartnerIds = groupBy(loans, (loan) => {
    return getPartnerId(loan);
  });

  const anonymizedVendorLookup = Object.fromEntries(
    Object.entries(groupedByPartnerIds).map(([partner_id, loans], index) => [
      partner_id,
      partner_id === "None" ? "N/A" : "Vendor" + (index + 1).toString(),
    ])
  );

  const anonymizedCompanyLookup = Object.fromEntries(
    Object.entries(groupedByCompanyIds).map(([company_id, loans], index) => [
      company_id,
      "Company" + (index + 1).toString(),
    ])
  );

  return { anonymizedCompanyLookup, anonymizedVendorLookup };
};

function getRows(
  loans: OpenLoanForDebtFacilityFragment[],
  supportedProductTypes: ProductTypeEnum[],
  lastDebtFacilityReportDate: string,
  isAnonymized: boolean
): RowsProp {
  const groupedLoans = groupBy(loans, (loan) => loan.company_id);
  const reducedLoans =
    Object.keys(groupedLoans).length !== 0
      ? reduceLineOfCreditLoans(groupedLoans)
      : [];
  const {
    anonymizedCompanyLookup,
    anonymizedVendorLookup,
  } = anonymizeLoanNames(reducedLoans, groupedLoans);

  return reducedLoans.map((loan) => ({
    ...loan,
    customer_identifier: createLoanCustomerIdentifier(
      loan,
      isAnonymized
        ? anonymizedCompanyLookup[loan.company_id.toString()]
        : undefined
    ),
    disbursement_identifier: createLoanDisbursementIdentifier(
      loan,
      isAnonymized
        ? anonymizedCompanyLookup[loan.company_id.toString()]
        : undefined
    ),
    artifact_name: getLoanArtifactName(loan),
    artifact_bank_note: loan.purchase_order
      ? truncateString(
          (loan as LoanArtifactFragment).purchase_order?.bank_note || ""
        )
      : "N/A",
    company_name: isAnonymized
      ? anonymizedCompanyLookup[loan.company_id.toString()]
      : loan.company.name,
    vendor_name: isAnonymized
      ? anonymizedVendorLookup[getPartnerId(loan).toString()]
      : getLoanVendorName(loan),
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
    total_principal_paid: !!loan.loan_report
      ? loan.loan_report.total_principal_paid
      : null,
    total_interest_paid: !!loan.loan_report
      ? loan.loan_report.total_interest_paid
      : null,
    total_fees_paid: !!loan.loan_report
      ? loan.loan_report.total_fees_paid
      : null,
    previously_assigned: determineIfPreviouslyAssigned(
      loan,
      lastDebtFacilityReportDate
    )
      ? "Yes"
      : "No",
    product_type: !!loan.company?.contract
      ? ProductTypeToLabel[
          loan.company.contract.product_type as ProductTypeEnum
        ]
      : null,
    us_state:
      !!loan.company?.licenses && loan.company?.licenses.length > 0
        ? loan.company?.licenses[0].us_state
        : null,
    borrower_eligibility: determineBorrowerEligibility(
      loan,
      supportedProductTypes
    ),
    loan_eligibility: determineLoanEligibility(loan, supportedProductTypes),
    debt_facility_added_date: !!loan.loan_report?.debt_facility_added_date
      ? loan.loan_report.debt_facility_added_date
      : "",
    invoice_date: getOriginationOrCreatedDate(loan),
    // until we start tracking purchase order due dates, we pull the same date as invoice_date
    // according to the finance team, this is a reason assumption for most purchase orders
    invoice_due_date: getOriginationOrCreatedDate(loan),
    gmv_financed: !!loan.company?.contract
      ? calculateGrossMarginValue(loan)
      : null,
    loan_count: countAdvancesSent(loan),
  }));
}

const getMaturityDate = (rowData: any) =>
  new Date(rowData.adjusted_maturity_date);

export default function DebtFacilityReportDataGrid({
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
  pageSize = 10,
  partnerType = PartnerEnum.VENDOR,
  filterByStatus,
  loans,
  selectedLoanIds,
  handleClickCustomer,
  handleClickPurchaseOrderBankNote,
  handleSelectLoans,
  supportedProductTypes,
  lastDebtFacilityReportDate,
  isAnonymized,
}: Props) {
  const [dataGrid, setDataGrid] = useState<any>(null);
  const rows = useMemo(
    () =>
      getRows(
        loans,
        supportedProductTypes,
        lastDebtFacilityReportDate,
        isAnonymized
      ),
    [loans, supportedProductTypes, lastDebtFacilityReportDate, isAnonymized]
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

  const daysPastDueRenderer = (value: any) => {
    const maturityTime = getMaturityDate(value.data).getTime();
    const nowTime = new Date(Date.now()).getTime();
    const daysPastDue = Math.floor(
      (nowTime - maturityTime) / (24 * 60 * 60 * 1000)
    );
    return daysPastDue > 0 ? daysPastDue.toString() : "-";
  };

  const daysPastDueBucketRenderer = (value: any) => {
    const maturityTime = getMaturityDate(value.data).getTime();
    const nowTime = new Date(Date.now()).getTime();
    const daysPastDue = Math.floor(
      (nowTime - maturityTime) / (24 * 60 * 60 * 1000)
    );

    if (daysPastDue <= 0) {
      return "Current";
    } else if (daysPastDue >= 1 && daysPastDue <= 30) {
      return "1-30DPD";
    } else if (daysPastDue >= 31 && daysPastDue <= 60) {
      return "31-60DPD";
    } else if (daysPastDue >= 61 && daysPastDue <= 90) {
      return "61-90DPD";
    } else if (daysPastDue >= 91) {
      return "90+DPD";
    }
  };

  const columns = useMemo(
    () => [
      {
        fixed: true,
        visible: isCompanyVisible,
        dataField: "company_name",
        caption: "Customer Name",
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: ValueFormatterParams) =>
          handleClickCustomer ? (
            <ClickableDataGridCell
              label={params.row.data.company_name}
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
        caption: "State",
        dataField: "us_state",
        width: ColumnWidths.Type,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) => (
          <TextDataGridCell label={params.row.data.us_state} />
        ),
      },
      {
        caption: "Product Type",
        dataField: "product_type",
        width: ColumnWidths.Type,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) => (
          <TextDataGridCell label={params.row.data.product_type} />
        ),
      },
      {
        caption: "Added to Debt Facility Date",
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
        caption: "Borrower Eligibility",
        dataField: "borrower_eligibility",
        width: ColumnWidths.Type,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) => (
          <TextDataGridCell label={params.row.data.borrower_eligibility} />
        ),
      },
      {
        caption: "Loan Eligibility",
        dataField: "loan_eligibility",
        width: ColumnWidths.Type,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) => (
          <TextDataGridCell label={params.row.data.loan_eligibility} />
        ),
      },
      {
        caption: "Previously Assigned",
        dataField: "previously_assigned",
        width: ColumnWidths.Type,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) => (
          <TextDataGridCell label={params.row.data.previously_assigned} />
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
        dataField: "vendor_name",
        caption: `Vendor Name`,
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: ValueFormatterParams) => (
          <TextDataGridCell label={params.row.data.vendor_name} />
        ),
      },
      {
        caption: "Invoice or PO Date",
        dataField: "invoice_date",
        width: ColumnWidths.Type,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) => (
          /*
            This purposefully used the text data cell instead of date data cell
            Since the function that pulls this value could pull either a date or
            a datetime, it made more sense to do the formatting in that function
            instead of here
          */
          <TextDataGridCell label={params.row.data.invoice_date} />
        ),
      },
      {
        caption: "Invoice or PO Due Date",
        dataField: "invoice_due_date",
        width: ColumnWidths.Type,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) => (
          /* See above comment on date vs text data grid cell */
          <TextDataGridCell label={params.row.data.invoice_due_date} />
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
        caption: "GMV Financed",
        dataField: "gmv_financed",
        width: ColumnWidths.Type,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.gmv_financed} />
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
        visible: isMaturityVisible && isDaysPastDueVisible,
        caption: "Days Past Due",
        width: 100,
        alignment: "right",
        calculateCellValue: (row: any) => daysPastDueRenderer({ data: row }),
      },
      {
        caption: "DPD Bucket",
        width: 100,
        alignment: "right",
        calculateCellValue: (row: any) =>
          daysPastDueBucketRenderer({ data: row }),
      },
      {
        caption: "Loan Count",
        dataField: "loan_count",
        width: ColumnWidths.Type,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) => (
          <TextDataGridCell label={params.row.data.loan_count} />
        ),
      },
    ],
    [
      isCompanyVisible,
      isDaysPastDueVisible,
      isDisbursementIdentifierVisible,
      isMaturityVisible,
      isReportingVisible,
      isStatusVisible,
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
