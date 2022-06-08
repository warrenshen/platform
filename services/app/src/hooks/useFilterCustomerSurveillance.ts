import { GetCustomersSurveillanceSubscription } from "generated/graphql";
import { filter, sortBy } from "lodash";
import { useMemo } from "react";

export const useFilterCustomerSurveillance = (
  searchQuery: string,
  customers: GetCustomersSurveillanceSubscription["customers"] | undefined
): GetCustomersSurveillanceSubscription["customers"] => {
  return useMemo(() => {
    const filteredCustomers = filter(
      customers || [],
      (customer) =>
        `${customer.name} ${customer.dba_name} ${customer.identifier}`
          .toLowerCase()
          .indexOf(searchQuery.toLowerCase()) >= 0
    );
    return sortBy(filteredCustomers, (customer) => customer.name);
  }, [searchQuery, customers]);
};
