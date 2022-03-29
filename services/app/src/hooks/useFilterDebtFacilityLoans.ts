import { filter } from "lodash";
import { useMemo } from "react";
import {
  GetOpenLoansByDebtFacilityStatusesSubscription,
  OpenLoanForDebtFacilityFragment,
} from "generated/graphql";

export const useFilterDebtFacilityLoansBySearchQuery = (
  searchQuery: string,
  data: GetOpenLoansByDebtFacilityStatusesSubscription | undefined
): OpenLoanForDebtFacilityFragment[] => {
  return useMemo(() => {
    const doesSearchQueryExistInDebtFacilityLoan = ({
      company,
    }: OpenLoanForDebtFacilityFragment) =>
      `${company.name}`.toLowerCase().indexOf(searchQuery.toLowerCase()) >= 0;

    return filter(data?.loans || [], doesSearchQueryExistInDebtFacilityLoan);
  }, [searchQuery, data?.loans]);
};