import {
  EbbaApplicationFragment,
  EbbaApplications,
  GetCustomerOldestContractQuery,
  useGetClosedEbbaApplicationsByCompanyIdQuery,
  useGetCustomerOldestContractQuery,
} from "generated/graphql";
import {
  getDifferenceInDays,
  getFifteenthOfGivenDate,
  getNMonthsPriorFromDate,
  howManyMonthsBetween,
  parseDateStringServer,
  previousXMonthsCertificationDates,
  withinNMonthsOfNow,
} from "lib/date";
import {
  FinancialReportsMaxMonthsAmount,
  PlatformModeEnum,
  ProductTypeEnum,
} from "lib/enum";

const getMissingFinancialReportsDates = (
  financialReports: EbbaApplications[]
) => {
  const financialReportsApplicationDates = financialReports.map(
    ({ application_date }: EbbaApplications) => application_date
  );

  return previousXMonthsCertificationDates(FinancialReportsMaxMonthsAmount).map(
    (certificationDate) => ({
      certificationDate,
      isOptionDisabled:
        financialReportsApplicationDates.indexOf(certificationDate) >= 0,
    })
  );
};

const areThereMissingFinancialReportsOlderThanNthMonth = (
  ebbaApplications: EbbaApplications[] = [],
  start_date: string,
  months: number
) => {
  if (!start_date || !withinNMonthsOfNow(start_date, -months)) {
    return false;
  }
  const fifteenthOfNthMonthsAgo = getNMonthsPriorFromDate(
    months,
    getFifteenthOfGivenDate(new Date())
  );

  const missingCertificationDates = getMissingFinancialReportsDates(
    ebbaApplications
  ).filter(({ isOptionDisabled }) => !isOptionDisabled);

  return (
    missingCertificationDates.length === 0 ||
    missingCertificationDates.filter(
      ({ certificationDate }) =>
        getDifferenceInDays(
          new Date(certificationDate),
          new Date(fifteenthOfNthMonthsAgo)
        ) < 0
    ).length > 0
  );
};

const isBorrowingBaseUpToDate = (
  ebbaApplication: EbbaApplicationFragment | undefined,
  productType: ProductTypeEnum | undefined
) => {
  return !ebbaApplication || !productType
    ? productType !== ProductTypeEnum.LineOfCredit
    : getDifferenceInDays(
        !!ebbaApplication?.expires_date
          ? parseDateStringServer(ebbaApplication?.expires_date)
          : new Date(),
        new Date()
      ) >= 0;
};

function calculateFinancialReportsAmount(
  oldestContract: GetCustomerOldestContractQuery["oldest_contract"] | undefined
) {
  if (!oldestContract || oldestContract.length === 0) {
    return 0;
  }

  const monthsSinceOldestContractStart = howManyMonthsBetween(
    new Date(oldestContract[0].start_date),
    new Date()
  );

  // Brittney mentioned that we should include a hard stop for how far we go back up to January 2022 (inclusive).
  // For context, customers would sometimes submit multiple months financials in the same month
  // (for example, October 2021 and November 2021 might both be in November. The surveillance team is now fixing / splitting these reports starting from January onwards).
  // So the three conditions to check for submitted financials are now:
  // 1) Max twelve months if customer has been around longer than a year.
  // 2) Max oldest contract if customer has been around less than a year.
  // 3) Hard stop of January 2022 regardless of (1) and (2)
  // The lowest of those values should be used to determine the amount of financial reports to fetch.
  // The following variable (monthsSinceJanuary2022) will become obsolete the 1st of January 2023 if we keep FinancialReportsMaxMonthsAmount at 12.

  const monthsSinceJanuary2022 = howManyMonthsBetween(
    new Date("2022-01-01"),
    new Date()
  );

  return Math.min(
    monthsSinceOldestContractStart,
    monthsSinceJanuary2022,
    FinancialReportsMaxMonthsAmount
  );
}

export const useGetMissingReportsInfo = (
  companyId: string,
  platformMode?: PlatformModeEnum | null
) => {
  const defaultResult = {
    missingFinancialReportCount: 0,
    isThereAnyFinancialReportOlderThanFourMonth: false,
    isLatestBorrowingBaseMissing: false,
  };

  // TLDR: For context "cache-and-network" policy is used to force a refetch.
  // This was to fix a bug where after approving a financial document
  // submission and going back to the customer’s overview page, the counter of missing
  // document wouldn’t change because the api call to get the info about the said docs
  // would get the data from cache instead of refetching the info from the api
  const {
    data: customersOldestContractData,
    loading: customersOldestContractLoading,
    error: customersOldestContractError,
  } = useGetCustomerOldestContractQuery({
    skip:
      !companyId ||
      (platformMode !== PlatformModeEnum.Customer &&
        platformMode !== PlatformModeEnum.Bank),
    fetchPolicy: "cache-and-network",
    variables: {
      company_id: companyId,
    },
  });

  const financialReportsAmount = calculateFinancialReportsAmount(
    customersOldestContractData?.oldest_contract
  );

  const {
    data: closedEbbaApplicationsData,
    loading: closedEbbaApplicationsLoading,
    error: closedEbbaApplicationsError,
  } = useGetClosedEbbaApplicationsByCompanyIdQuery({
    skip:
      financialReportsAmount === 0 ||
      !companyId ||
      !!customersOldestContractError,
    fetchPolicy: "cache-and-network",
    variables: {
      company_id: companyId,
      financial_report_amount: financialReportsAmount,
    },
  });

  if (customersOldestContractError) {
    console.error({ customersOldestContractError });
    alert(
      `Error in query (details in console): ${customersOldestContractError.message}`
    );
    return defaultResult;
  }

  if (closedEbbaApplicationsError) {
    console.error({ closedEbbaApplicationsError });
    alert(
      `Error in query (details in console): ${closedEbbaApplicationsError.message}`
    );
    return defaultResult;
  }

  const isLoading =
    customersOldestContractLoading || closedEbbaApplicationsLoading;

  return {
    missingFinancialReportCount: isLoading
      ? 0
      : financialReportsAmount -
        (closedEbbaApplicationsData?.financial_reports.length || 0),
    isThereAnyFinancialReportOlderThanFourMonth: isLoading
      ? false
      : areThereMissingFinancialReportsOlderThanNthMonth(
          (closedEbbaApplicationsData?.financial_reports as EbbaApplications[]) ||
            [],
          customersOldestContractData?.oldest_contract[0]?.start_date || "",
          4
        ),
    isLatestBorrowingBaseMissing: isLoading
      ? false
      : !isBorrowingBaseUpToDate(
          closedEbbaApplicationsData?.borrowing_base[0],
          customersOldestContractData?.oldest_contract[0]
            ?.product_type as ProductTypeEnum
        ),
  };
};
