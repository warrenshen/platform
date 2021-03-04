import { LoanStatusEnum, PurchaseOrderFragment } from "generated/graphql";
import { authenticatedApi, loansRoutes } from "lib/api";

export type LoanUpsert = {
  id: string | null;
  artifact_id: string;
  amount: number;
  requested_payment_date: string | null;
};

export type PurchaseOrderLoanUpsert = {
  loan: LoanUpsert;
  artifact: PurchaseOrderFragment;
};

export type PurchaseOrdersLoansUpsert = {
  variables: {
    status: LoanStatusEnum;
    data: PurchaseOrderLoanUpsert[];
  };
};

export type PurchaseOrdersLoansUpsertResponse = {
  status: string;
  msg: string;
};

export async function upsertPurchaseOrdersLoansMutation(
  request: PurchaseOrdersLoansUpsert
): Promise<PurchaseOrdersLoansUpsertResponse> {
  return authenticatedApi
    .post(loansRoutes.upsertPurchaseOrdersLoans, request.variables)
    .then((response) => response.data)
    .then(
      (response) => response,
      (error) => {
        console.error("Failed upsert purchase orders loans. Err:", error);
        return {
          status: "ERROR",
          msg: "Request failure. Wait a beat and try again or contact support.",
        };
      }
    );
}
