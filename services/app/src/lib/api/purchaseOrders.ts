import { PurchaseOrders, RequestStatusEnum } from "generated/graphql";
import {
  authenticatedApi,
  CustomMutationResponse,
  purchaseOrdersRoutes,
} from "lib/api";

export type SubmitPurchaseOrderReq = {
  variables: {
    purchase_order_id: PurchaseOrders["id"];
  };
};

export async function submitPurchaseOrderMutation(
  req: SubmitPurchaseOrderReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(purchaseOrdersRoutes.submitForApproval, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not submit purchase order",
        };
      }
    );
}

export type RespondToPurchaseOrderApprovalReq = {
  variables: {
    purchase_order_id: PurchaseOrders["id"];
    new_request_status: RequestStatusEnum;
    rejection_note: string;
    link_val: string;
  };
};

export async function respondToPurchaseOrderApprovalRequestMutation(
  req: RespondToPurchaseOrderApprovalReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(purchaseOrdersRoutes.respondToApprovalRequest, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not respond to purchase order approval request",
        };
      }
    );
}
