// This file is for library code to handle logic (mostly handled by the backend)
// when it comes to creating payment transactions

import { Companies } from "generated/graphql";
import { authenticatedApi, CustomMutationResponse, loansRoutes } from "lib/api";

export type RunCustomerBalancesReq = {
  variables: {
    company_id?: Companies["id"];
    report_date: string;
  };
};

export async function runCustomerBalancesMutation(
  req: RunCustomerBalancesReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(loansRoutes.runCustomerBalances, req.variables)
    .then((res) => {
      return res.data;
    })
    .then(
      (response) => {
        return response;
      },
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not run customer balances for an unexpected reason",
        };
      }
    );
}
