import { OpenLoanForDebtFacilityFragment } from "generated/graphql";
import {
  DebtFacilityStatusEnum,
  DebtFacilityCompanyStatusEnum,
  DebtFacilityStatusToEligibility,
  ProductTypeEnum,
} from "lib/enum";

export const determineLoanEligibility = (
  loan: OpenLoanForDebtFacilityFragment
) => {
  if (
    !!loan.loan_report?.debt_facility_status &&
    !!loan.company?.debt_facility_status &&
    loan.company.contracts[0].product_type
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
      Unless the company is a dispensary financing client. DF clients should default to ineligible,
      but we provide an extra check here.
    */
    if (
      companyStatus !== DebtFacilityCompanyStatusEnum.GOOD_STANDING &&
      companyStatus !== DebtFacilityCompanyStatusEnum.WAIVER
    ) {
      return loanStatus === DebtFacilityStatusEnum.WAIVER
        ? "Eligible"
        : "Ineligible";
    } else {
      const productType = loan.company.contracts[0]
        .product_type as ProductTypeEnum;
      return productType === ProductTypeEnum.DispensaryFinancing
        ? "Ineligible"
        : DebtFacilityStatusToEligibility[
            loan.loan_report.debt_facility_status as DebtFacilityStatusEnum
          ];
    }
  } else {
    return null;
  }
};
