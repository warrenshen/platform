import { CurrentCustomerContext } from "contexts/CurrentCustomerContext";
import {
  Companies,
  useGetCustomerFinancialSummaryByDateSubscription,
} from "generated/graphql";
import { todayAsDateStringServer } from "lib/date";
import { ReactNode } from "react";

interface Props {
  companyId: Companies["id"];
  children: ReactNode;
}

export default function CurrentCustomerProvider({
  companyId,
  children,
}: Props) {
  const { data, error } = useGetCustomerFinancialSummaryByDateSubscription({
    fetchPolicy: "network-only",
    variables: {
      company_id: companyId,
      date: todayAsDateStringServer(),
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const company = data?.companies_by_pk;
  const financialSummary = company?.financial_summaries[0] || null;

  return (
    <CurrentCustomerContext.Provider
      value={{
        financialSummary,
      }}
    >
      {children}
    </CurrentCustomerContext.Provider>
  );
}
