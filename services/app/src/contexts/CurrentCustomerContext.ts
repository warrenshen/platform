import { FinancialSummaryFragment } from "generated/graphql";
import { createContext } from "react";

export type CurrentCustomerContextType = {
  financialSummary: FinancialSummaryFragment | null;
};

export const CurrentCustomerContext = createContext<CurrentCustomerContextType>(
  {
    financialSummary: null,
  }
);
