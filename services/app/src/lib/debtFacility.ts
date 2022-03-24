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
  console.log(isProductTypeSupported);

  // Company status alone *could* cover the use case here
  // But adding this extra check around future debt facility support will be useful
  // since we don't know a priori what that support will entail
  return !!companyLevelEligibility && !!isProductTypeSupported
    ? DebtFacilityCompanyStatusToEligibility[
        DebtFacilityCompanyStatusEnum.GOOD_STANDING
      ]
    : DebtFacilityCompanyStatusToEligibility[
        DebtFacilityCompanyStatusEnum.INELIGIBLE_FOR_FACILITY
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
    */
    if (
      companyStatus !== DebtFacilityCompanyStatusEnum.GOOD_STANDING &&
      companyStatus !== DebtFacilityCompanyStatusEnum.WAIVER
    ) {
      return loanStatus === DebtFacilityStatusEnum.WAIVER
        ? "Eligible"
        : "Ineligible";
    } else {
      const productType = getProductTypeFromOpenLoanForDebtFacilityFragment(
        loan
      );
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
