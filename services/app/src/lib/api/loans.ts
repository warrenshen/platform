import { Loans } from "generated/graphql";
import { authenticatedApi, CustomMutationResponse, loansRoutes } from "lib/api";

type SubmitLoanReq = {
  variables: {
    loan_id: Loans["id"];
  };
};

export async function submitLoanMutation(
  req: SubmitLoanReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(loansRoutes.submitForApproval, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not submit loan",
        };
      }
    );
}

type DeleteLoanReq = {
  variables: {
    loan_id: Loans["id"];
  };
};

export async function deleteLoanMutation(
  req: DeleteLoanReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(loansRoutes.deleteLoan, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not delete loan",
        };
      }
    );
}

export async function approveLoans(
  loanIds: Loans["id"][]
): Promise<{ status: string; msg: string }> {
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

type RejectLoanReq = {
  variables: {
    loan_id: Loans["id"];
    rejection_note: string;
  };
};

export async function rejectLoanMutation(
  req: RejectLoanReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(loansRoutes.rejectLoan, req.variables)
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
