import { OpenLoanForDebtFacilityFragment } from "generated/graphql";
import { DayInMilliseconds, parseDateStringServer } from "lib/date";
import {
  DebtFacilityCompanyStatusEnum,
  DebtFacilityCompanyStatusToEligibility,
  DebtFacilityStatusEnum,
  DebtFacilityStatusToEligibility,
  ProductTypeEnum,
} from "lib/enum";

export const getProductTypeFromOpenLoanForDebtFacilityFragment = (
  loan: OpenLoanForDebtFacilityFragment
) => {
  return !!loan?.company?.contract?.product_type
    ? (loan.company.contract.product_type as ProductTypeEnum)
    : ProductTypeEnum.None;
};

export const determineBorrowerEligibility = (
  loan: OpenLoanForDebtFacilityFragment,
  supportedProductTypes: ProductTypeEnum[]
) => {
  const companyLevelEligibility = !!loan.company?.debt_facility_status
    ? DebtFacilityCompanyStatusToEligibility[
        loan.company.debt_facility_status as DebtFacilityCompanyStatusEnum
      ]
    : null;

  const productType = getProductTypeFromOpenLoanForDebtFacilityFragment(loan);
  const isProductTypeSupported = supportedProductTypes.includes(productType);

  // Company status alone *could* cover the use case here
  // But adding this extra check around future debt facility support will be useful
  // since we don't know a priori what that support will entail
  return companyLevelEligibility === "Waiver"
    ? companyLevelEligibility
    : companyLevelEligibility === "Eligible" && !!isProductTypeSupported
    ? DebtFacilityCompanyStatusToEligibility[
        DebtFacilityCompanyStatusEnum.GoodStanding
      ]
    : DebtFacilityCompanyStatusToEligibility[
        DebtFacilityCompanyStatusEnum.IneligibleForFacility
      ];
};

export const determineLoanEligibility = (
  loan: OpenLoanForDebtFacilityFragment,
  supportedProductTypes: ProductTypeEnum[]
) => {
  if (
    !!loan.loan_report?.debt_facility_status &&
    !!loan.company?.debt_facility_status &&
    !!loan?.company?.contract?.product_type
  ) {
    const companyStatus = loan.company
      .debt_facility_status as DebtFacilityCompanyStatusEnum;
    const loanStatus = loan.loan_report
      .debt_facility_status as DebtFacilityStatusEnum;

    /*
      If a company is not in good standing, but the loan has a waiver, then the loan is eligible.
      Otherwise, if the company is not in good standing, then the loan is not eligible
      This was a special case discussed with the finance team

      When a company is in good standing, the loan's eligibility is determined purely by loan status
      and if the debt facility for the report supports that product type

      For LoC customers, since we merge open loans into one blob, we won't have a loan_report, so we
      need to check for their loan status in a separate if blocks
    */
    const productType = getProductTypeFromOpenLoanForDebtFacilityFragment(loan);
    if (
      productType === ProductTypeEnum.LineOfCredit &&
      (companyStatus === DebtFacilityCompanyStatusEnum.GoodStanding ||
        companyStatus === DebtFacilityCompanyStatusEnum.OnProbation ||
        companyStatus === DebtFacilityCompanyStatusEnum.Waiver)
    ) {
      return "Eligible";
    } else if (productType === ProductTypeEnum.LineOfCredit) {
      return "Ineligible";
    } else if (
      companyStatus !== DebtFacilityCompanyStatusEnum.GoodStanding &&
      companyStatus !== DebtFacilityCompanyStatusEnum.OnProbation &&
      companyStatus !== DebtFacilityCompanyStatusEnum.Waiver
    ) {
      return loanStatus === DebtFacilityStatusEnum.Waiver
        ? "Eligible"
        : "Ineligible";
    } else {
      return supportedProductTypes.includes(productType)
        ? DebtFacilityStatusToEligibility[
            loan.loan_report.debt_facility_status as DebtFacilityStatusEnum
          ]
        : "Ineligible";
    }
  } else {
    return "Ineligible";
  }
};

export const getMaturityDate = (
  loan: OpenLoanForDebtFacilityFragment
): Date => {
  return parseDateStringServer(loan.adjusted_maturity_date);
};

export const getDaysPastDue = (
  loan: OpenLoanForDebtFacilityFragment
): number => {
  // If the loan is already repaid, then DPD should be zero
  // if it was paid on time, otherwise the days late from
  // when it was paid
  if (!!loan.closed_at) {
    // Multiple calls to parseDateStringServer may seem odd, but it strips the timestamp off
    // so I don't have worry about funky edge cases and timezones since
    // we only care about calendar days in PST in this scenario
    const closed_date = parseDateStringServer(
      parseDateStringServer(loan.closed_at).toDateString()
    );
    const maturity_date = getMaturityDate(loan);
    const daysPaidPastDue = Math.floor(
      (closed_date.valueOf() - maturity_date.valueOf()) / DayInMilliseconds
    );

    return daysPaidPastDue;
  }

  const maturityTime = getMaturityDate(loan).getTime();
  const nowTime = new Date(Date.now()).getTime();
  const daysPastDue = Math.floor(
    (nowTime.valueOf() - maturityTime.valueOf()) / DayInMilliseconds
  );

  return daysPastDue > 0 ? daysPastDue : 0;
};

export const getDaysPastDueBucket = (
  loan: OpenLoanForDebtFacilityFragment
): string => {
  const daysPastDue = getDaysPastDue(loan);

  if (daysPastDue <= 0) {
    return "Current";
  } else if (daysPastDue >= 1 && daysPastDue <= 15) {
    return "1-15DPD";
  } else if (daysPastDue >= 16 && daysPastDue <= 30) {
    return "16-30DPD";
  } else if (daysPastDue >= 31 && daysPastDue <= 60) {
    return "31-60DPD";
  } else if (daysPastDue >= 61 && daysPastDue <= 90) {
    return "61-90DPD";
  } else if (daysPastDue >= 91 && daysPastDue <= 120) {
    return "91-120DPD";
  } else if (daysPastDue >= 121 && daysPastDue <= 150) {
    return "121-150DPD";
  } else {
    return "151+DPD";
  }
};
