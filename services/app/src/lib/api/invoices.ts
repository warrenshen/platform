import { Invoices, InvoicesInsertInput } from "generated/graphql";
import {
  authenticatedApi,
  CustomMutationResponse,
  invoicesRoutes,
} from "lib/api";

export type SubmitInvoiceForApprovalRequest = {
  variables: {
    invoice_id: Invoices["id"];
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
    files: InvoiceFileItem[];
  };
};

export async function createInvoiceMutation(
  request: UpsertInvoiceRequest
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(invoicesRoutes.create, request.variables)
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

export async function updateInvoiceMutation(
  request: UpsertInvoiceRequest
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(invoicesRoutes.update, request.variables)
    .then((response) => response.data)
    .then(
      (response) => response,
      (error) => {
        console.error("Failed to update an invoice. Err:", error);
        return {
          status: "ERROR",
          msg: "Failed to update an invoice",
        };
      }
    );
}
