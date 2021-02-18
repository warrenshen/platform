// This file is for library code to handle logic (mostly handled by the backend)
// when it comes to creating payment transactions

import { Loans } from "generated/graphql";
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

export async function approveLoans(
  loanIds: Loans["id"][]
): Promise<{ status: string }> {
  return authenticatedApi
    .post(loansRoutes.approveLoans, { loan_ids: loanIds })
    .then((res) => res.data)
    .then(
      (response) => response,
      (error) => {
        console.log("Error", error);
        return {
          status: "ERROR",
          msg: "Could not approve loan(s) for an unexpected reason",
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
