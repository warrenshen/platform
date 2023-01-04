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
        console.error("error", error);
        return {
          status: "ERROR",
          msg: "Could not submit loan",
        };
      }
    );
}

type SubmitLoanReqNew = {
  variables: {
    create_or_update_loans: SubmitLoanReq["variables"][];
    delete_loan_ids: DeleteLoanReq["variables"][];
  };
};

export async function submitLoanMutationNew(
  req: SubmitLoanReqNew
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(loansRoutes.submitForApprovalNew, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.error("error", error);
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
        console.error("error", error);
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
        console.error("error", error);
        return {
          status: "ERROR",
          msg: "Could not delete loan",
        };
      }
    );
}

type ArchiveLoanReq = {
  variables: {
    loan_id: Loans["id"];
    company_id: Companies["id"];
  };
};

export async function archiveLoanMutation(
  req: ArchiveLoanReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(loansRoutes.archiveLoan, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.error("error", error);
        return {
          status: "ERROR",
          msg: "Could not archive loan",
        };
      }
    );
}

export async function unarchiveLoanMutation(
  req: ArchiveLoanReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(loansRoutes.unarchiveLoan, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.error("error", error);
        return {
          status: "ERROR",
          msg: "Could not unarchive loan",
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
        console.error("Error", error);
        return {
          status: "ERROR",
          msg: "Could not approve loan(s) for an unexpected reason",
        };
      }
    );
}

type RejectLoanReqNew = {
  variables: {
    loan_id: Loans["id"];
    rejection_note: string;
    reject_releated_purchase_order: boolean;
    is_vendor_approval_required: boolean;
  };
};

export async function rejectLoanNewMutation(
  req: RejectLoanReqNew
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(loansRoutes.rejectLoanNew, req.variables)
    .then((res) => {
      return res.data;
    })
    .then(
      (response) => {
        return response;
      },
      (error) => {
        console.error("error", error);
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
    customer_notes?: string;
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
