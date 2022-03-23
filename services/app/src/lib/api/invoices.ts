import {
  Invoices,
  InvoicesInsertInput,
  RequestStatusEnum,
} from "generated/graphql";
import {
  authenticatedApi,
  CustomMutationResponse,
  invoicesRoutes,
} from "lib/api";
import { RepaymentMethodEnum } from "lib/enum";

export type SubmitInvoiceForApprovalRequest = {
  variables: {
    id: Invoices["id"];
  };
};

type InvoiceFileItem = {
  invoice_id: string;
  file_id: string;
  file_type: string;
};

export type UpsertInvoiceRequest = {
  variables: {
    invoice: InvoicesInsertInput;
    invoice_files: InvoiceFileItem[];
  };
};

export type SubmitInvoiceForPaymentRequest = {
  variables: {
    invoice_ids: Invoices["id"][];
  };
};

export type SubmitNewInvoiceForPaymentRequest = {
  variables: {
    invoice_id: Invoices["id"];
  };
};

export type RespondToInvoicePaymentRequest = {
  variables: {
    invoice_id: Invoices["id"];
    new_status: RequestStatusEnum;
    rejection_note: string | null;
    link_val: string;
    amount: number | null;
    anticipated_payment_date: string | null;
    payment_method: RepaymentMethodEnum | null;
  };
};

export async function createUpdateInvoiceAsDraftMutation(
  request: UpsertInvoiceRequest
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(invoicesRoutes.createUpdateAsDraft, request.variables)
    .then((response) => response.data)
    .then(
      (response) => response,
      (error) => {
        console.error("Failed to create an invoice. Err:", error);
        return {
          status: "ERROR",
          msg: "Failed to create an invoice",
        };
      }
    );
}

export type DeleteInvoiceMutationReq = {
  variables: {
    invoice_id: Invoices["id"];
  };
};

export async function deleteInvoiceMutation(
  req: DeleteInvoiceMutationReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(invoicesRoutes.delete, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not delete invoice",
        };
      }
    );
}

export async function submitInvoiceForApproval(
  request: SubmitInvoiceForApprovalRequest
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(invoicesRoutes.submitForApproval, request.variables)
    .then((response) => response.data)
    .then(
      (response) => response,
      (error) => {
        console.error("Failed to submit invoice for approval. Err:", error);
        return {
          status: "ERROR",
          msg: "Failed to update an invoice",
        };
      }
    );
}

export async function submitInvoiceForPaymentMutation(
  request: SubmitInvoiceForPaymentRequest
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(invoicesRoutes.submitForPayment, request.variables)
    .then((response) => response.data)
    .then(
      (response) => response,
      (error) => {
        console.error("Failed to submit invoices for payment. Err:", error);
        return {
          status: "ERROR",
          msg: "Failed to submit invoice(s) for payment",
        };
      }
    );
}

export async function respondToInvoicePaymentMutation(
  request: RespondToInvoicePaymentRequest
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(invoicesRoutes.respondToPaymentRequest, request.variables)
    .then((response) => response.data)
    .then(
      (response) => response,
      (error) => {
        console.error("Failed to repson to invoice approval. Err:", error);
        return {
          status: "ERROR",
          msg: "Failed to respond to invoice request for payment.",
        };
      }
    );
}

export type RespondToInvoiceApprovalReq = {
  variables: {
    invoice_id: Invoices["id"];
    new_request_status: RequestStatusEnum;
    rejection_note: string;
    link_val: string;
  };
};

export async function respondToInvoiceApprovalRequestMutation(
  req: RespondToInvoiceApprovalReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(invoicesRoutes.respondToApprovalRequest, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not respond to invoice approval request",
        };
      }
    );
}

export async function submitNewInvoiceForPaymentMutation(
  request: SubmitNewInvoiceForPaymentRequest
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(invoicesRoutes.submitNewInvoiceForPayment, request.variables)
    .then((response) => response.data)
    .then(
      (response) => response,
      (error) => {
        console.error("Failed to submit new invoice for payment. Err:", error);
        return {
          status: "ERROR",
          msg: "Failed to submit new invoice for payment",
        };
      }
    );
}
