import { GetCustomersCurrentSurveillanceSubscription } from "generated/graphql";
import { filter, sortBy } from "lodash";
import { useMemo } from "react";

export const useFilterCustomerSurveillance = (
  searchQuery: string,
  customers:
    | GetCustomersCurrentSurveillanceSubscription["customers"]
    | undefined
): GetCustomersCurrentSurveillanceSubscription["customers"] => {
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
