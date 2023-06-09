// This file is for library code to handle logic (mostly handled by the backend)
// when it comes to creating payment transactions

import { Companies } from "generated/graphql";
import { CustomMutationResponse, authenticatedApi, loansRoutes } from "lib/api";

export type RunCustomerBalancesReq = {
  variables: {
    company_id?: Companies["id"];
    start_date: string;
    report_date: string;
    include_debug_info: boolean;
  };
};

export async function runCustomerBalancesMutation(
  req: RunCustomerBalancesReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(loansRoutes.runCustomerBalances, req.variables)
    .then((response) => response.data)
    .then(
      (response) => response,
      (error) => {
        console.error({ error });
        return {
          status: "ERROR",
          msg: "Could not run customer balances for an unexpected reason",
        };
      }
    );
}

export type RunCustomerLoanPredictionsReq = {
  variables: {
    company_id: Companies["id"];
    prediction_date: string;
  };
};

export async function runCustomerLoanPredictionsMutation(
  req: RunCustomerLoanPredictionsReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(loansRoutes.runLoanPredictions, req.variables)
    .then((response) => response.data)
    .then(
      (response) => response,
      (error) => {
        console.error(error);
        return {
          status: "ERROR",
          msg: "Could not run loan predictions for an unexpected reason",
        };
      }
    );
}
