import {
  CustomerSurveillanceFragment,
  CustomerSurveillanceResultFragment,
} from "generated/graphql";
import {
  computeDaysUntilExpiration,
  formatDateString,
  formatDatetimeString,
} from "lib/date";
import {
  FeatureFlagEnum,
  ProductTypeEnum,
  QualifyForEnum,
  QualifyForToLabel,
  ReportingRequirementsCategoryEnum,
  SurveillanceStatusEnum,
} from "lib/enum";
import { formatCurrency, formatPercentage } from "lib/number";

export const getLoansAwaitingForAdvanceAmount = (
  customer: CustomerSurveillanceFragment
): [number, string] => {
  const loanTotal = customer?.loans.reduce(
    (total, { amount }) => total + amount,
    0
  );

  return [loanTotal, formatCurrency(loanTotal, "$0")];
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
    ? QualifyForToLabel[surveillanceResult.qualifying_product as QualifyForEnum]
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
  customer: CustomerSurveillanceFragment
): string => {
  return !!customer?.most_recent_financial_report?.[0]?.application_date
    ? formatDateString(
        customer.most_recent_financial_report[0].application_date
      ) || "-"
    : "-";
};

export const getFinancialReportExpirationDate = (
  customer: CustomerSurveillanceFragment
): string => {
  return !!customer?.most_recent_financial_report?.[0]?.expires_date
    ? formatDatetimeString(
        customer.most_recent_financial_report[0].expires_date,
        false
      ) || "-"
    : "-";
};

export const getDaysUntilFinancialReportExpires = (
  customer: CustomerSurveillanceFragment
): [number, string] => {
  const expirationDate = !!customer?.most_recent_financial_report?.[0]
    ?.expires_date
    ? customer.most_recent_financial_report[0].expires_date
    : null;

  const daysUntilExpiration = !!expirationDate
    ? computeDaysUntilExpiration(expirationDate)
    : 0;

  return daysUntilExpiration >= 0
    ? [daysUntilExpiration, daysUntilExpiration.toString()]
    : [0, "Expired"];
};

export const getBorrowingBaseApplicationDate = (
  customer: CustomerSurveillanceFragment
): string => {
  return !!customer?.most_recent_borrowing_base?.[0]?.application_date
    ? formatDateString(
        customer.most_recent_borrowing_base[0].application_date
      ) || "-"
    : "-";
};

export const getBorrowingBaseExpirationDate = (
  customer: CustomerSurveillanceFragment
): string => {
  return !!customer?.most_recent_borrowing_base?.[0]?.expires_date
    ? formatDatetimeString(
        customer.most_recent_borrowing_base[0].expires_date,
        false
      ) || "-"
    : "-";
};

export const getDaysUntilBorrowingBaseExpires = (
  customer: CustomerSurveillanceFragment,
  productType: ProductTypeEnum
): [number, string] => {
  if (productType === ProductTypeEnum.LineOfCredit) {
    const expirationDate = !!customer?.most_recent_borrowing_base?.[0]
      ?.expires_date
      ? customer.most_recent_borrowing_base[0].expires_date
      : null;

    const daysUntilExpiration = !!expirationDate
      ? computeDaysUntilExpiration(expirationDate)
      : 0;

    return daysUntilExpiration >= 0
      ? [daysUntilExpiration, daysUntilExpiration.toString()]
      : [0, "Expired"];
  } else {
    return [0, "N/A"];
  }
};

export const getPercentagePastDue = (
  customer: CustomerSurveillanceFragment
): [number, string] => {
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

  return [totalPercentagePastDue, formatPercentage(totalPercentagePastDue)];
};

export const getMostPastDueLoanDays = (
  customer: CustomerSurveillanceFragment
): number => {
  return !!customer?.most_recent_financial_summary?.[0]?.most_overdue_loan_days
    ? customer.most_recent_financial_summary[0].most_overdue_loan_days
    : 0;
};
