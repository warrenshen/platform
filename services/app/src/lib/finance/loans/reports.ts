// This file is for library code to handle logic (mostly handled by the backend)
// when it comes to creating payment transactions

import { Companies } from "generated/graphql";
import { authenticatedApi, loansRoutes } from "lib/api";

export async function runCustomerBalances(req: {
  company_id?: Companies["id"];
  report_date: string;
}): Promise<{ status: string; msg: string }> {
  return authenticatedApi
    .post(loansRoutes.runCustomerBalances, req)
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
