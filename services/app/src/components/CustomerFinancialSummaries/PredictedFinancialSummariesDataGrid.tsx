import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
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

function getRows(loans: CombinedLoanData[]): RowsProp {
  return loans.map((loan, index) => {
    return formatRowModel({
      company_id: loan.companyId,
      company_name: loan.companyName,
      daily_interest_rate: loan.dailyInterestRate,
      date: loan.date,
      id: index,
      interest_accrued_today: loan.interestAccruedToday,
      late_fees_accrued_today: loan.lateFeesAccruedToday,
      loan_identifier: loan.loanIdentifier,
      per_loan_late_fee_schedule: loan.perLoanLateFeeSchedule,
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
  loanIdentifier: string;
  perLoanLateFeeSchedule: number;
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
  loanIdentifierLookup: Record<string, string>,
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

      return loans.map((loan) => {
        const maturityDate = !!loanMaturityDateLookup.hasOwnProperty(
          loan.loanId
        )
          ? parseDateStringServer(loanMaturityDateLookup[loan.loanId])
          : null;

        // Since we're looking for days past due, we want today as the second parameter
        const daysPastDue = !!maturityDate
          ? getDifferenceInDays(maturityDate, today)
          : 0;

        const perLoanFeeSchedule =
          daysPastDue > 0
            ? getLateFeeMultiplier(daysPastDue, lateFeeSchedule)
            : 0;

        return {
          companyId: companyId,
          companyName: companyName,
          dailyInterestRate: loan.dailyInterestRate,
          date: loanDate,
          interestAccruedToday: loan.interestAccruedToday,
          lateFeesAccruedToday: loan.lateFeesAccruedToday,
          loanIdentifier: `${companyIdentifier}/${
            loanIdentifierLookup[loan.loanId]
          }`,
          perLoanLateFeeSchedule: perLoanFeeSchedule, //lateFeeScheduleString,
          productType: productType,
          outstandingInterest: loan.outstandingInterest,
          outstandingLateFees: loan.outstandingFees,
          outstandingPrincipal: loan.outstandingPrincipal,
        } as CombinedLoanData;
      });
    }
  );

  const mappedFinancialSummaries: CombinedLoanData[] =
    financialSummaries.flatMap((financialSummary) => {
      const loanInfoDicts: Record<
        string,
        Record<string, number | string>
      > = !!financialSummary?.loans_info ? financialSummary.loans_info : {};

      const summaryDate = parseDateStringServer(financialSummary.date);

      const lateFeeSchedule =
        !!financialSummary?.date &&
        dateToLateFeeSchedule.hasOwnProperty(financialSummary.date)
          ? dateToLateFeeSchedule[financialSummary.date]
          : ([] as LateFeeSchedule[]);

      return Object.keys(loanInfoDicts).length > 0
        ? Object.entries(loanInfoDicts).flatMap((loanInfoArray) => {
            const loanInfoId = loanInfoArray[0];
            const loanInfo = loanInfoArray[1];

            const maturityDate = !!loanMaturityDateLookup.hasOwnProperty(
              loanInfoId
            )
              ? parseDateStringServer(loanMaturityDateLookup[loanInfoId])
              : null;

            // Since we're looking for days past due, we want today as the second parameter
            const daysPastDue = !!maturityDate
              ? getDifferenceInDays(maturityDate, summaryDate)
              : 0;

            const perLoanFeeSchedule =
              daysPastDue > 0
                ? getLateFeeMultiplier(daysPastDue, lateFeeSchedule)
                : 0;

            return {
              companyId: companyId,
              companyName: companyName,
              dailyInterestRate: financialSummary.daily_interest_rate,
              date: parseDateStringServer(financialSummary.date),
              interestAccruedToday: loanInfo.interest_accrued_today,
              lateFeesAccruedToday: loanInfo.fees_accrued_today,
              loanIdentifier: `${companyIdentifier}/${loanIdentifierLookup[loanInfoId]}`,
              perLoanLateFeeSchedule: perLoanFeeSchedule,
              productType: productType,
              outstandingInterest: loanInfo.outstanding_interest,
              outstandingLateFees: loanInfo.outstanding_late_fees,
              outstandingPrincipal: loanInfo.outstanding_principal,
            } as CombinedLoanData;
          })
        : ([] as CombinedLoanData[]);
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
  loanIdentifierLookup: Record<string, string>;
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
  loanIdentifierLookup,
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
    loanIdentifierLookup,
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
        cellRender: (params: ValueFormatterParams) =>
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
        dataField: "loan_identifier",
        caption: "Loan",
        width: ColumnWidths.MinWidth,
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
        dataField: "per_loan_late_fee_schedule",
        caption: "Per Loan Late Fee Schedule",
        width: ColumnWidths.Currency,
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
