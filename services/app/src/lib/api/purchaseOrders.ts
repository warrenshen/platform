import { PurchaseOrders } from "generated/graphql";
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
