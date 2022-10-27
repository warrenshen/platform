import { Companies, FinancialSummaryFragment } from "generated/graphql";
import { createContext } from "react";

export type CurrentCustomerContextType = {
  financialSummary: FinancialSummaryFragment | null;
  companyId: Companies["id"] | null;
};

export const CurrentCustomerContext = createContext<CurrentCustomerContextType>(
  {
    financialSummary: null,
    companyId: null,
  }
);
