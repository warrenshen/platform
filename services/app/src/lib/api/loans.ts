import {
  Companies,
  Invoices,
  LoanTypeEnum,
  Loans,
  PurchaseOrders,
} from "generated/graphql";
import { CustomMutationResponse, authenticatedApi, loansRoutes } from "lib/api";

type SubmitLoanReq = {
  variables: {
    amount: number;
    artifact_id: PurchaseOrders["id"] | Invoices["id"];
    company_id: Companies["id"];
    loan_id: Loans["id"];
    loan_type: LoanTypeEnum;
    requested_payment_date: string;
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

// TEMPORARY
type SubmitLoCLoanReq = {
  variables: {
    loan_id: Loans["id"];
  };
};

export async function submitLoCLoanMutation(
  req: SubmitLoCLoanReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(loansRoutes.submitLoCForApproval, req.variables)
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
// END TEMPORARY

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

type SaveLoanReq = {
  variables: {
    amount: number;
    artifact_id: PurchaseOrders["id"] | Invoices["id"];
    company_id: Companies["id"];
    loan_id: Loans["id"];
    loan_type: LoanTypeEnum;
    requested_payment_date: string;
  };
};

export async function saveLoanMutation(
  req: SaveLoanReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(loansRoutes.saveLoan, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.error(error);
        return {
          status: "ERROR",
          msg: "Could not save loan",
        };
      }
    );
}
