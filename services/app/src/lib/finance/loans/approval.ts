// This file is for library code to handle logic (mostly handled by the backend)
// when it comes to creating payment transactions

import { authenticatedApi, loansRoutes } from "lib/api";

export async function approveLoan(req: {
  loan_id: string;
}): Promise<{ status: string; msg: string }> {
  return authenticatedApi
    .post(loansRoutes.approveLoan, req)
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
          msg: "Could not approve loan for an unexpected reason",
        };
      }
    );
}

export async function rejectLoan(req: {
  loan_id: string;
  rejection_note: string;
}): Promise<{ status: string; msg: string }> {
  return authenticatedApi
    .post(loansRoutes.rejectLoan, req)
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
          msg: "Could not reject loan for an unexpected reason",
        };
      }
    );
}
