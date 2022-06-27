import {
  CustomerSurveillanceFragment,
  CustomerSurveillanceResultFragment,
} from "generated/graphql";
import {
  computeDaysUntilExpiration,
  dateAsDateStringClient,
  dateStringPlusXDaysDate,
  formatDateString,
  parseDateStringServer,
} from "lib/date";
import {
  FeatureFlagEnum,
  ProductTypeEnum,
  QualifyForEnum,
  ReportingRequirementsCategoryEnum,
  SurveillanceStatusEnum,
} from "lib/enum";

export const getLoansAwaitingForAdvanceAmount = (
  customer: CustomerSurveillanceFragment
): number => {
  const loanTotal = customer?.loans.reduce(
    (total, { amount }) => total + amount,
    0
  );

  return loanTotal;
};

const getSurveillanceResult = (
  customer: CustomerSurveillanceFragment,
  isCurrent: boolean
): CustomerSurveillanceResultFragment | null => {
  return !!isCurrent
    ? !!customer?.all_surveillance_results?.[0]
      ? customer.all_surveillance_results[0]
      : null
    : !!customer?.target_surveillance_result?.[0]
    ? customer.target_surveillance_result[0]
    : null;
};

export const getCustomerSurveillanceStatus = (
  customer: CustomerSurveillanceFragment,
  isCurrent: boolean
): SurveillanceStatusEnum | null => {
  const surveillanceResult = getSurveillanceResult(customer, isCurrent);

  return !!surveillanceResult?.surveillance_status
    ? (surveillanceResult.surveillance_status as SurveillanceStatusEnum)
    : null;
};

export const getCustomerProductType = (
  customer: CustomerSurveillanceFragment
): string => {
  return !!customer?.most_recent_financial_summary?.[0]?.product_type
    ? customer.most_recent_financial_summary[0].product_type
    : "None";
};

export const getCustomerQualifyingDate = (
  customer: CustomerSurveillanceFragment,
  isCurrent: boolean
): string => {
  const surveillanceResult = getSurveillanceResult(customer, isCurrent);

  return !!surveillanceResult?.qualifying_date
    ? formatDateString(surveillanceResult.qualifying_date) || "-"
    : "-";
};

export const getCustomerQualifyingProduct = (
  customer: CustomerSurveillanceFragment,
  isCurrent: boolean
): string => {
  const surveillanceResult = getSurveillanceResult(customer, isCurrent);

  return !!surveillanceResult?.qualifying_product
    ? (surveillanceResult.qualifying_product as QualifyForEnum)
    : "-";
};

export const getSurveillanceBankNote = (
  customer: CustomerSurveillanceFragment,
  isCurrent: boolean
): string => {
  const surveillanceResult = getSurveillanceResult(customer, isCurrent);

  return !!surveillanceResult?.bank_note ? surveillanceResult.bank_note : "-";
};

export const isCustomerFinancialsMetrcBased = (
  customer: CustomerSurveillanceFragment
): boolean => {
  const featureFlags = !!customer?.settings?.feature_flags_payload
    ? customer.settings.feature_flags_payload
    : {};
  const flag = FeatureFlagEnum.ReportingRequirementsCategory;
  const category = ReportingRequirementsCategoryEnum.Four;

  return featureFlags.hasOwnProperty(flag)
    ? featureFlags[flag] === category
    : false;
};

export const getFinancialReportApplicationDate = (
  customer: CustomerSurveillanceFragment | null | undefined
): {
  financialReportDateString: string;
  financialReportDate: Date | null;
} => {
  const applicationDate = !!customer?.most_recent_financial_report?.[0]
    ?.application_date
    ? customer.most_recent_financial_report[0].application_date
    : null;

  return {
    financialReportDateString: !!applicationDate
      ? formatDateString(applicationDate) || ""
      : "-",
    financialReportDate: !!applicationDate
      ? parseDateStringServer(applicationDate)
      : null,
  };
};

export const getFinancialReportExpirationDate = (
  customer: CustomerSurveillanceFragment
): string => {
  // The expiration date refers to when the report would be late, but
  // not triggering the on pause status. This wasn't what the cs
  // dashboard needed
  const applicationDate = !!customer?.most_recent_financial_report?.[0]
    ?.application_date
    ? customer.most_recent_financial_report[0].application_date
    : null;

  return !!applicationDate
    ? dateAsDateStringClient(dateStringPlusXDaysDate(applicationDate, 75))
    : "-";
};

export const getDaysUntilFinancialReportExpires = (
  customer: CustomerSurveillanceFragment
): {
  daysUntilFinancialReportExpiresNumber: number;
  daysUntilFinancialReportExpiresString: string;
} => {
  const expirationDate = getFinancialReportExpirationDate(customer);

  const daysUntilExpiration = !!expirationDate
    ? computeDaysUntilExpiration(expirationDate)
    : 0;

  return {
    daysUntilFinancialReportExpiresNumber:
      daysUntilExpiration >= 0 ? daysUntilExpiration : 0,
    daysUntilFinancialReportExpiresString:
      daysUntilExpiration >= 0 ? daysUntilExpiration.toString() : "Expired",
  };
};

export const getBorrowingBaseApplicationDate = (
  customer: CustomerSurveillanceFragment | null | undefined
): {
  borrowingBaseDateString: string;
  borrowingBaseDate: Date | null;
} => {
  const applicationDate = !!customer?.most_recent_borrowing_base?.[0]
    ?.application_date
    ? customer.most_recent_borrowing_base[0].application_date
    : null;

  return {
    borrowingBaseDateString: !!applicationDate
      ? formatDateString(applicationDate) || "-"
      : "-",
    borrowingBaseDate: !!applicationDate
      ? parseDateStringServer(applicationDate)
      : null,
  };
};

export const getBorrowingBaseExpirationDate = (
  customer: CustomerSurveillanceFragment
): string => {
  // The expiration date refers to when the report would be late, but
  // not triggering the on pause status. This wasn't what the cs
  // dashboard needed
  const applicationDate = !!customer?.most_recent_borrowing_base?.[0]
    ?.application_date
    ? customer.most_recent_borrowing_base[0].application_date
    : null;

  return !!applicationDate
    ? dateAsDateStringClient(dateStringPlusXDaysDate(applicationDate, 60))
    : "-";
};

export const getDaysUntilBorrowingBaseExpires = (
  customer: CustomerSurveillanceFragment,
  productType: ProductTypeEnum
): {
  daysUntilBorrowingBaseExpiresNumber: number;
  daysUntilBorrowingBaseExpiresString: string;
} => {
  if (productType === ProductTypeEnum.LineOfCredit) {
    const expirationDate = getBorrowingBaseExpirationDate(customer);

    const daysUntilExpiration = !!expirationDate
      ? computeDaysUntilExpiration(expirationDate)
      : 0;

    return {
      daysUntilBorrowingBaseExpiresNumber:
        daysUntilExpiration >= 0 ? daysUntilExpiration : 0,
      daysUntilBorrowingBaseExpiresString:
        daysUntilExpiration >= 0 ? daysUntilExpiration.toString() : "Expired",
    };
  } else {
    return {
      daysUntilBorrowingBaseExpiresNumber: 0,
      daysUntilBorrowingBaseExpiresString: "N/A",
    };
  }
};

export const getPercentagePastDue = (
  customer: CustomerSurveillanceFragment
): number => {
  const totalOutstandingPrincipalPastDue = !!customer
    ?.most_recent_financial_summary?.[0]?.total_outstanding_principal_past_due
    ? customer.most_recent_financial_summary[0]
        .total_outstanding_principal_past_due
    : 0.0;

  const totalOutstandingPrincipal = !!customer
    ?.most_recent_financial_summary?.[0]?.total_outstanding_principal
    ? customer.most_recent_financial_summary[0].total_outstanding_principal
    : 0.0;

  const totalPercentagePastDue =
    totalOutstandingPrincipal > 0
      ? totalOutstandingPrincipalPastDue / totalOutstandingPrincipal
      : 0.0;

  return totalPercentagePastDue;
};

export const getMostPastDueLoanDays = (
  customer: CustomerSurveillanceFragment
): number => {
  return !!customer?.most_recent_financial_summary?.[0]?.most_overdue_loan_days
    ? customer.most_recent_financial_summary[0].most_overdue_loan_days
    : 0;
};
