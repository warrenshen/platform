import { GridValueFormatterParams } from "@material-ui/data-grid";
import LoanDrawerLauncher from "components/Loan/LoanDrawerLauncher";
import DebtFacilityStatusChip from "components/Shared/Chip/DebtFacilityStatusChip";
import LoanPaymentStatusChip from "components/Shared/Chip/LoanPaymentStatusChip";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import {
  Companies,
  Loans,
  OpenLoanForDebtFacilityFragment,
} from "generated/graphql";
import { parseDateStringServer } from "lib/date";
import {
  determineBorrowerEligibility,
  determineLoanEligibility,
  getCustomerIdentifier,
  getDaysUntilMaturity,
  getDebtFacilityAddedDate,
  getDebtFacilityName,
  getDebtFacilityStatus,
  getFinancingDayLimit,
  getFinancingPeriod,
  getLoanIdentifier,
  getMaturityDate,
  getProductTypeFromOpenLoanForDebtFacilityFragment,
  getRepaymentDate,
  getVendorName,
} from "lib/debtFacility";
import {
  DebtFacilityStatusEnum,
  DebtFacilityStatusToLabel,
  LoanPaymentStatusEnum,
  LoanPaymentStatusToLabel,
  ProductTypeEnum,
  ProductTypeToLabel,
} from "lib/enum";
import { getLoanArtifactName } from "lib/loans";
import { ColumnWidths, formatRowModel } from "lib/tables";
import { useMemo } from "react";

interface Props {
  // visibility flags
  isDebtFacilityVisible?: boolean;
  isEligibilityVisible?: boolean;
  isExcelExport?: boolean;
  isMultiSelectEnabled?: boolean;

  // data grid controls
  pager?: boolean;
  pageSize?: number;

  // data
  loans: OpenLoanForDebtFacilityFragment[];
  supportedProductTypes?: ProductTypeEnum[];
  selectedLoanIds?: Loans["id"][];

  // event handling
  handleClickCustomer?: (customerId: Companies["id"]) => void;
  handleSelectLoans?: (loans: OpenLoanForDebtFacilityFragment[]) => void;
}

function getRows(
  loans: OpenLoanForDebtFacilityFragment[],
  supportedProductTypes: ProductTypeEnum[]
) {
  return loans.map((loan) => {
    const productType = getProductTypeFromOpenLoanForDebtFacilityFragment(loan);

    return formatRowModel({
      ...loan,
      artifact_name: getLoanArtifactName(loan),
      borrower_eligibility: determineBorrowerEligibility(
        loan,
        supportedProductTypes,
        productType
      ),
      customer_identifier: getCustomerIdentifier({
        loan,
        productType,
      }),
      debt_facility_added_date: getDebtFacilityAddedDate(loan),
      debt_facility: getDebtFacilityName(loan),
      debt_facility_status: getDebtFacilityStatus(loan),

      disbursement_identifier: getLoanIdentifier({
        loan,
        productType,
      }),
      financing_day_limit: getFinancingDayLimit(loan, productType),
      financing_period: getFinancingPeriod(loan, productType),
      loan_eligibility: determineLoanEligibility(
        loan,
        supportedProductTypes,
        productType
      ),
      maturing_in_days: getDaysUntilMaturity(loan, productType),
      maturity_date: getMaturityDate(loan, productType),
      origination_date: parseDateStringServer(loan.origination_date),
      product_type: productType,
      repayment_date: getRepaymentDate(loan, productType),
      vendor_name: getVendorName(loan, productType),
    });
  });
}

export default function DebtFacilityLoansDataGrid({
  // visibility flags
  isDebtFacilityVisible = false,
  isEligibilityVisible = false,
  isExcelExport = true,
  isMultiSelectEnabled = false,

  // data grid controls
  pager = true,
  pageSize = 10,

  // data
  loans,
  supportedProductTypes = [] as ProductTypeEnum[],
  selectedLoanIds,

  // event handling
  handleClickCustomer,
  handleSelectLoans,
}: Props) {
  const rows = useMemo(
    () => getRows(loans, supportedProductTypes),
    [loans, supportedProductTypes]
  );

  const columns = useMemo(
    () => [
      {
        fixed: true,
        dataField: "customer_identifier",
        caption: "Customer Identifier",
        width: ColumnWidths.Identifier,
        alignment: "left",
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
        dataField: "debt_facility_status",
        caption: "Debt Facility Status",
        width: ColumnWidths.Status,
        alignment: "center",
        cellRender: (params: GridValueFormatterParams) => (
          <DebtFacilityStatusChip
            debtFacilityStatus={
              params.row.data.debt_facility_status as DebtFacilityStatusEnum
            }
          />
        ),
        lookup: {
          dataSource: {
            store: {
              type: "array",
              data: Object.values(DebtFacilityStatusEnum).map(
                (debtFacilityStatus) => ({
                  debt_facility_status: debtFacilityStatus,
                  label: DebtFacilityStatusToLabel[debtFacilityStatus],
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
                (loanPaymentStatus) => ({
                  payment_status: loanPaymentStatus,
                  label: LoanPaymentStatusToLabel[loanPaymentStatus],
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
        dataField: "company.name",
        caption: "Customer Name",
        minWidth: ColumnWidths.MinWidth,
        alignment: "left",
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
        dataField: "product_type",
        caption: "Product Type",
        minWidth: ColumnWidths.MinWidth,
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
        visible: isEligibilityVisible,
        caption: "Borrower Eligibility",
        dataField: "borrower_eligibility",
        width: ColumnWidths.Type,
        alignment: "left",
      },
      {
        visible: isDebtFacilityVisible,
        caption: "Debt Facility",
        dataField: "debt_facility",
        width: ColumnWidths.Type,
        alignment: "left",
      },
      {
        visible: isDebtFacilityVisible,
        caption: "Assigned to Debt Facility Date",
        format: "shortDate",
        dataField: "debt_facility_added_date",
        width: ColumnWidths.Type,
        alignment: "right",
      },
      {
        visible: isEligibilityVisible,
        caption: "Loan Eligibility",
        dataField: "loan_eligibility",
        width: ColumnWidths.Type,
        alignment: "left",
      },
      {
        caption: "Loan Amount",
        dataField: "amount",
        format: {
          type: "currency",
          precision: 2,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "vendor_name",
        caption: `Vendor Name`,
        minWidth: ColumnWidths.MinWidth,
        alignment: "left",
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
        caption: "Maturing in (Days)",
        dataField: "maturing_in_days",
        width: 100,
        alignment: "right",
      },
      {
        dataField: "outstanding_principal_balance",
        caption: "Outstanding Principal",
        format: {
          type: "currency",
          precision: 2,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "outstanding_interest",
        caption: "Outstanding Interest",
        format: {
          type: "currency",
          precision: 2,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "outstanding_fees",
        caption: "Oustanding Late Fees",
        format: {
          type: "currency",
          precision: 2,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
    ],
    [isDebtFacilityVisible, isEligibilityVisible, handleClickCustomer]
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

  return (
    <ControlledDataGrid
      pager
      isExcelExport={isExcelExport}
      select={isMultiSelectEnabled}
      filtering={{ enable: true }}
      pageSize={pageSize}
      dataSource={rows}
      columns={columns}
      selectedRowKeys={selectedLoanIds}
      onSelectionChanged={handleSelectionChanged}
    />
  );
}
