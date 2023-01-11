import {
  GetOpenLoansByDebtFacilityStatusesQuery,
  OpenLoanForDebtFacilityFragment,
} from "generated/graphql";
import { filter } from "lodash";
import { useMemo } from "react";

export const useFilterDebtFacilityLoansBySearchQuery = (
  searchQuery: string,
  data: GetOpenLoansByDebtFacilityStatusesQuery | undefined
): OpenLoanForDebtFacilityFragment[] => {
  return useMemo(() => {
    const doesSearchQueryExistInDebtFacilityLoan = ({
      company,
    }: OpenLoanForDebtFacilityFragment) =>
      `${company.name}`.toLowerCase().indexOf(searchQuery.toLowerCase()) >= 0;

    const companies = data?.companies || [];
    const loans = companies.flatMap((company) => {
      return company.loans;
    });

    return filter(loans || [], doesSearchQueryExistInDebtFacilityLoan);
  }, [searchQuery, data]);
};
