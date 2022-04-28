import { GetCustomersWithMetadataQuery } from "generated/graphql";
import { filter, sortBy } from "lodash";
import { useMemo } from "react";

export const useFilterCustomers = (
  searchQuery: string,
  data: GetCustomersWithMetadataQuery | undefined
): GetCustomersWithMetadataQuery["customers"] => {
  return useMemo(() => {
    const filteredCustomers = filter(
      data?.customers || [],
      (customer) =>
        `${customer.name} ${customer.dba_name} ${customer.identifier}`
          .toLowerCase()
          .indexOf(searchQuery.toLowerCase()) >= 0
    );
    return sortBy(filteredCustomers, (customer) => customer.name);
  }, [searchQuery, data?.customers]);
};
