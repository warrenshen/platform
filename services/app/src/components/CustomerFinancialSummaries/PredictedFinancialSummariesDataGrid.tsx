import { GridValueFormatterParams } from "@material-ui/data-grid";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import {
  Companies,
  FinancialSummaryWithLoansInfoFragment,
} from "generated/graphql";
import { getDifferenceInDays, parseDateStringServer } from "lib/date";
import { ProductTypeEnum, ProductTypeToLabel } from "lib/enum";
import { CurrencyPrecision, PercentPrecision } from "lib/number";
import { formatRowModel } from "lib/tables";
import { ColumnWidths } from "lib/tables";
import {
  DailyLoanPrediction,
  LateFeeSchedule,
} from "pages/Bank/Reports/PredictedFinancialsByCustomerTab";
import { useMemo } from "react";

function getRows(loans: CombinedLoanData[]) {
  return loans.map((loan, index) => {
    return formatRowModel({
      company_id: loan.companyId,
      company_name: loan.companyName,
      daily_interest_rate: loan.dailyInterestRate,
      date: loan.date,
      id: index,
      interest_accrued_today: loan.interestAccruedToday,
      late_fees_accrued_today: loan.lateFeesAccruedToday,
      product_type: ProductTypeToLabel[loan.productType],
      outstanding_interest: loan.outstandingInterest,
      outstanding_late_fees: loan.outstandingLateFees,
      outstanding_principal: loan.outstandingPrincipal,
    });
  });
}

interface CombinedLoanData {
  companyId: string;
  companyName: string;
  dailyInterestRate: number;
  date: Date;
  interestAccruedToday: number;
  lateFeesAccruedToday: number;
  productType: ProductTypeEnum;
  outstandingInterest: number;
  outstandingLateFees: number;
  outstandingPrincipal: number;
}

const getLateFeeMultiplier = (
  daysPastDue: number,
  lateFeeSchedules: LateFeeSchedule[]
): number => {
  const matchingFees = lateFeeSchedules.filter((schedule) => {
    const start = schedule.start;
    const end = schedule.end;

    const isBetweenPeriod =
      start !== -1 && end !== -1 && daysPastDue >= start && daysPastDue <= end;
    const isAfterPeriod = start !== -1 && end === -1 && daysPastDue >= start;

    return isBetweenPeriod || isAfterPeriod;
  });

  // We are filtering for all matches in the late fee schedule
  // and then taking the max late fee multiplier because that is
  // associated with the latest matching part of the schedule
  // If it isn't late (i.e. doesn't have matching fees) then we
  // just return 0
  return !!matchingFees?.[0]?.fee ? matchingFees[0].fee : 0;
};

const combineFinancialSummariesAndLoanPredictions = (
  companyId: string,
  companyIdentifier: string,
  companyName: string,
  dateToLateFeeSchedule: Record<string, LateFeeSchedule[]>,
  financialSummaries: FinancialSummaryWithLoansInfoFragment[],
  loanMaturityDateLookup: Record<string, string>,
  loanPredictions: DailyLoanPrediction[]
): CombinedLoanData[] => {
  // We'll need to grab information from the most recent
  // financial summary such as product type and loan identifiers
  // for use in the prediction data
  const mostRecentFinancialSummary = financialSummaries[0];
  const productType = !!mostRecentFinancialSummary?.product_type
    ? mostRecentFinancialSummary?.product_type
    : ProductTypeEnum.None;
  const today = new Date();

  const mappedLoanPredictions: CombinedLoanData[] = loanPredictions.flatMap(
    (loanPrediction) => {
      const loanDate = !!loanPrediction?.date
        ? parseDateStringServer(loanPrediction.date)
        : null;
      const loans = !!loanPrediction?.predictions
        ? loanPrediction.predictions
        : [];

      const lateFeeSchedule =
        !!loanPrediction?.date &&
        dateToLateFeeSchedule.hasOwnProperty(loanPrediction.date)
          ? dateToLateFeeSchedule[loanPrediction.date]
          : ([] as LateFeeSchedule[]);

      const totalLateFeesAccruedToday = loans.reduce((sum, loan) => {
        const maturityDate = !!loanMaturityDateLookup.hasOwnProperty(
          loan.loanId
        )
          ? parseDateStringServer(loanMaturityDateLookup[loan.loanId])
          : null;

        // Since we're looking for days past due, we want today as the second parameter
        const daysPastDue = !!maturityDate
          ? getDifferenceInDays(today, maturityDate)
          : 0;

        const feeMultiplier =
          daysPastDue > 0
            ? getLateFeeMultiplier(daysPastDue, lateFeeSchedule)
            : 0;

        const interestAccruedToday = !!loan?.interestAccruedToday
          ? loan.interestAccruedToday
          : 0;

        return sum + interestAccruedToday * feeMultiplier;
      }, 0);

      const totalInterestAccruedToday = loans.reduce(
        (sum, loan) => sum + loan.interestAccruedToday,
        0
      );
      const totalOutstandingPrincipal = loans.reduce(
        (sum, loan) => sum + loan.outstandingPrincipal,
        0
      );
      const totalOutstandingInterest = loans.reduce(
        (sum, loan) => sum + loan.outstandingInterest,
        0
      );
      const totalOutstandingLateFees = loans.reduce(
        (sum, loan) => sum + loan.outstandingFees,
        0
      );

      return {
        companyId: companyId,
        companyName: companyName,
        dailyInterestRate: financialSummaries?.[0]?.daily_interest_rate || 0.0,
        date: loanDate,
        interestAccruedToday: totalInterestAccruedToday,
        lateFeesAccruedToday: totalLateFeesAccruedToday,
        productType: productType,
        outstandingInterest: totalOutstandingInterest,
        outstandingLateFees: totalOutstandingLateFees,
        outstandingPrincipal: totalOutstandingPrincipal,
      } as CombinedLoanData;
    }
  );

  const mappedFinancialSummaries: CombinedLoanData[] =
    financialSummaries.flatMap((financialSummary) => {
      return {
        companyId: companyId,
        companyName: companyName,
        dailyInterestRate: financialSummary.daily_interest_rate,
        date: parseDateStringServer(financialSummary.date),
        interestAccruedToday: financialSummary.interest_accrued_today,
        lateFeesAccruedToday: financialSummary.late_fees_accrued_today,
        productType: productType,
        outstandingInterest: financialSummary.total_outstanding_interest,
        outstandingLateFees: financialSummary.total_outstanding_fees,
        outstandingPrincipal: financialSummary.total_outstanding_principal,
      } as CombinedLoanData;
    });

  return mappedLoanPredictions.concat(mappedFinancialSummaries);
};

interface Props {
  isExcelExport?: boolean;
  isFilteringEnabled?: boolean;
  isSortingDisabled?: boolean;
  companyId: string;
  companyIdentifier: string;
  companyName: string;
  dateToLateFeeSchedule: Record<string, LateFeeSchedule[]>;
  financialSummaries: FinancialSummaryWithLoansInfoFragment[];
  loanMaturityDateLookup: Record<string, string>;
  loanPredictions: DailyLoanPrediction[];
  handleClickCustomer?: (customerId: Companies["id"]) => void;
}

export default function PredictedFinancialSummariesDataGrid({
  isExcelExport = true,
  isFilteringEnabled = false,
  isSortingDisabled = true,
  companyId,
  companyIdentifier,
  companyName,
  dateToLateFeeSchedule,
  financialSummaries,
  loanMaturityDateLookup,
  loanPredictions,
  handleClickCustomer,
}: Props) {
  const combinedData = combineFinancialSummariesAndLoanPredictions(
    companyId,
    companyIdentifier,
    companyName,
    dateToLateFeeSchedule,
    financialSummaries,
    loanMaturityDateLookup,
    loanPredictions
  );

  const rows = getRows(combinedData);
  const columns = useMemo(
    () => [
      {
        fixed: true,
        dataField: "date",
        caption: "Date",
        format: "shortDate",
        width: ColumnWidths.Date,
        alignment: "right",
      },
      {
        dataField: "company_name",
        caption: "Customer Name",
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: GridValueFormatterParams) =>
          handleClickCustomer ? (
            <ClickableDataGridCell
              label={params.row.data.company_name}
              onClick={() => handleClickCustomer(params.row.data.company_id)}
            />
          ) : (
            params.row.data.company_name
          ),
      },
      {
        dataField: "product_type",
        caption: "Product Type",
        width: ColumnWidths.ProductType,
      },
      {
        dataField: "outstanding_principal",
        caption: "Principal Balance (PB)",
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
        dataField: "outstanding_late_fees",
        caption: "Outstanding Late Fees",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "daily_interest_rate",
        caption: "Daily Interest Rate",
        format: {
          type: "percent",
          precision: PercentPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "interest_accrued_today",
        caption: "Interest Accrued Today",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "late_fees_accrued_today",
        caption: "Late Fees Accrued Today",
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

  const filtering = useMemo(
    () => ({ enable: isFilteringEnabled }),
    [isFilteringEnabled]
  );

  return (
    <ControlledDataGrid
      isExcelExport={isExcelExport}
      isSortingDisabled={isSortingDisabled}
      filtering={filtering}
      dataSource={rows}
      columns={columns}
    />
  );
}
