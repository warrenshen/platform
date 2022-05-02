import { OpenLoanForDebtFacilityFragment } from "generated/graphql";
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
