import { GetActiveUsersByRolesQuery, Users } from "generated/graphql";
import { filter } from "lodash";
import { useMemo } from "react";

export const useFilterUserByCompanyName = (
  searchQuery: string,
  data: GetActiveUsersByRolesQuery | undefined
) =>
  useMemo((): Users[] => {
    const doesSearchQueryExistInUserCompanyName = ({ company }: Users) =>
      `${company?.name}`.toLowerCase().indexOf(searchQuery.toLowerCase()) >= 0;

    return filter(
      (data?.users as Users[]) || [],
      doesSearchQueryExistInUserCompanyName
    );
  }, [data?.users, searchQuery]);
