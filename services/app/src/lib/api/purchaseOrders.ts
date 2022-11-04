import {
  Maybe,
  PurchaseOrderFilesInsertInput,
  PurchaseOrderMetrcTransfersInsertInput,
  PurchaseOrders,
  PurchaseOrdersInsertInput,
  RequestStatusEnum,
  Users,
} from "generated/graphql";
import {
  CustomMutationResponse,
  authenticatedApi,
  purchaseOrdersRoutes,
} from "lib/api";

export type CreateUpdatePurchaseOrderAsDraftReq = {
  variables: {
    purchase_order: PurchaseOrdersInsertInput;
    purchase_order_files: PurchaseOrderFilesInsertInput[];
    purchase_order_metrc_transfers: PurchaseOrderMetrcTransfersInsertInput[];
  };
};

export type CreateUpdatePurchaseOrderAsDraftReqNew = {
  variables: {
    purchase_order: PurchaseOrdersInsertInput;
    purchase_order_files: PurchaseOrderFilesInsertInput[];
    purchase_order_metrc_transfers: PurchaseOrderMetrcTransfersInsertInput[];
    action: string;
  };
};

export async function createUpdatePurchaseOrderAsDraftMutation(
  req: CreateUpdatePurchaseOrderAsDraftReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(purchaseOrdersRoutes.createUpdateAsDraft, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.error(error);
        return {
          status: "ERROR",
          msg: "Could not save purchase order",
        };
      }
    );
}

export async function createUpdatePurchaseOrderAsDraftNewMutation(
  req: CreateUpdatePurchaseOrderAsDraftReqNew
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(purchaseOrdersRoutes.createUpdateAsDraftNew, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.error(error);
        return {
          status: "ERROR",
          msg: "Could not save purchase order",
        };
      }
    );
}

export type CreateUpdatePurchaseOrderAndSubmitReq = {
  variables: {
    purchase_order: PurchaseOrdersInsertInput;
    purchase_order_files: PurchaseOrderFilesInsertInput[];
    purchase_order_metrc_transfers: PurchaseOrderMetrcTransfersInsertInput[];
    action: string;
  };
};

export async function createUpdatePurchaseOrderAndSubmitMutation(
  req: CreateUpdatePurchaseOrderAndSubmitReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(purchaseOrdersRoutes.createUpdateAndSubmit, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.error(error);
        return {
          status: "ERROR",
          msg: "Could not save and submit purchase order",
        };
      }
    );
}

export type SubmitPurchaseOrderUpdateReq = {
  variables: {
    purchase_order: PurchaseOrdersInsertInput;
    purchase_order_files: PurchaseOrderFilesInsertInput[];
    purchase_order_metrc_transfers: PurchaseOrderMetrcTransfersInsertInput[];
    action: string;
  };
};

export async function submitPurchaseOrderUpdateMutation(
  req: SubmitPurchaseOrderUpdateReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(purchaseOrdersRoutes.submitPurchaseOrderUpdate, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.error(error);
        return {
          status: "ERROR",
          msg: "Could not save and submit purchase order",
        };
      }
    );
}

export type UpdatePurchaseOrderReq = {
  variables: {
    purchase_order: PurchaseOrdersInsertInput;
    purchase_order_files: PurchaseOrderFilesInsertInput[];
  };
};

export async function updatePurchaseOrderMutation(
  req: UpdatePurchaseOrderReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(purchaseOrdersRoutes.update, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.error(error);
        return {
          status: "ERROR",
          msg: "Could not update purchase order",
        };
      }
    );
}

export async function updatePurchaseOrderNewMutation(
  req: UpdatePurchaseOrderReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(purchaseOrdersRoutes.updateNew, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.error(error);
        return {
          status: "ERROR",
          msg: "Could not update purchase order",
        };
      }
    );
}

export type SubmitPurchaseOrderReq = {
  variables: {
    purchase_order: PurchaseOrdersInsertInput;
  };
};

export async function submitPurchaseOrderMutation(
  req: SubmitPurchaseOrderReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(purchaseOrdersRoutes.submit, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.error(error);
        return {
          status: "ERROR",
          msg: "Could not submit purchase order",
        };
      }
    );
}

export async function submitPurchaseOrderNewMutation(
  req: SubmitPurchaseOrderReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(purchaseOrdersRoutes.submitNew, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.error(error);
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
    rejected_by_user_id?: Users["id"];
    approved_by_user_id?: Users["id"];
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
        console.error(error);
        return {
          status: "ERROR",
          msg: "Could not respond to purchase order approval request",
        };
      }
    );
}

export type RespondToPurchaseOrderApprovalNewReq = {
  variables: {
    purchase_order_id: PurchaseOrders["id"];
    new_request_status: RequestStatusEnum;
    rejection_note: string;
    rejected_by_user_id?: Users["id"];
    approved_by_user_id?: Users["id"];
    link_val: string;
  };
};

export async function respondToPurchaseOrderApprovalRequestNewMutation(
  req: RespondToPurchaseOrderApprovalNewReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(purchaseOrdersRoutes.approvePurchaseOrder, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.error(error);
        return {
          status: "ERROR",
          msg: "Could not respond to purchase order approval request",
        };
      }
    );
}

export type ApprovePurchaseOrderReq = {
  variables: {
    purchase_order_id: PurchaseOrders["id"];
    new_request_status: RequestStatusEnum;
    rejection_note: string;
    rejected_by_user_id?: Users["id"];
    approved_by_user_id?: Users["id"];
    link_val: string;
  };
};

export async function approvePurchaseOrderutation(
  req: ApprovePurchaseOrderReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(purchaseOrdersRoutes.approvePurchaseOrder, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.error(error);
        return {
          status: "ERROR",
          msg: "Could not approve purchase order",
        };
      }
    );
}

export type RespondToPurchaseOrderRequestChangesReq = {
  variables: {
    purchase_order_id: PurchaseOrders["id"];
    new_request_status: RequestStatusEnum;
    rejection_note: string;
    rejected_by_user_id?: Users["id"];
    approved_by_user_id?: Users["id"];
    link_val: string;
  };
};

export async function respondToPurchaseOrderRequestChangesMutation(
  req: RespondToPurchaseOrderRequestChangesReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(purchaseOrdersRoutes.respondToRequestChanges, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.error(error);
        return {
          status: "ERROR",
          msg: "Could not respond to purchase order change request",
        };
      }
    );
}

export type RespondToPurchaseOrderIncompleteReq = {
  variables: {
    purchase_order_id: PurchaseOrders["id"];
    new_request_status: RequestStatusEnum;
    incomplete_note: string;
    link_val: string;
  };
};

export async function respondToPurchaseOrderIncompleteRequestMutation(
  req: RespondToPurchaseOrderIncompleteReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(purchaseOrdersRoutes.respondToIncompleteRequest, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.error(error);
        return {
          status: "ERROR",
          msg: "Could not respond to purchase order incomplete request",
        };
      }
    );
}

export type UpdateBankFieldsReq = {
  variables: {
    purchase_order_id: PurchaseOrders["id"];
    bank_note: string;
  };
};

export async function updateBankFieldsMutation(
  req: UpdateBankFieldsReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(purchaseOrdersRoutes.updateBankFields, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.error(error);
        return {
          status: "ERROR",
          msg: "Could not update purchase order",
        };
      }
    );
}

export type DeletePurchaseOrderReq = {
  variables: {
    purchase_order_id: PurchaseOrders["id"];
  };
};

export async function deletePurchaseOrderMutation(
  req: DeletePurchaseOrderReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(purchaseOrdersRoutes.delete, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.error(error);
        return {
          status: "ERROR",
          msg: "Could not delete purchase order",
        };
      }
    );
}

export type ClosePurchaseOrderReq = {
  variables: {
    purchase_order_id: PurchaseOrders["id"];
  };
};

export async function closePurchaseOrderMutation(
  req: ClosePurchaseOrderReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(purchaseOrdersRoutes.close, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.error(error);
        return {
          status: "ERROR",
          msg: "Could not close purchase order",
        };
      }
    );
}

export type ClosePurchaseOrderMultipleReq = {
  variables: {
    purchase_order_ids: PurchaseOrders["id"][];
  };
};

export async function archivePurchaseOrderMultipleMutation(
  req: ClosePurchaseOrderMultipleReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(purchaseOrdersRoutes.archiveMultiple, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.error(error);
        return {
          status: "ERROR",
          msg: "Could not close purchase order",
        };
      }
    );
}

export type ReopenPurchaseOrderReq = {
  variables: {
    purchase_order_id: PurchaseOrders["id"];
  };
};

export async function reopenPurchaseOrderMutation(
  req: ReopenPurchaseOrderReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(purchaseOrdersRoutes.reopen, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.error(error);
        return {
          status: "ERROR",
          msg: "Could not reopen purchase order",
        };
      }
    );
}

export type RejectPurchaseOrderReq = {
  variables: {
    purchase_order_id: PurchaseOrders["id"];
    rejection_note: string;
    rejected_by_user_id: Maybe<string>;
    link_val: string;
  };
};

export async function rejectPurchaseOrderMutation(
  req: RejectPurchaseOrderReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(purchaseOrdersRoutes.rejectPurchaseOrder, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.error(error);
        return {
          status: "ERROR",
          msg: "Could not reject purchase order",
        };
      }
    );
}

export type RequestPurchaseOrderChangesReq = {
  variables: {
    purchase_order_id: PurchaseOrders["id"];
    requested_changes_note: string;
    requested_by_user_id: Maybe<string>;
    link_val: string;
    is_vendor_approval_required: boolean;
  };
};

export async function requestPurchaseOrderChangesMutation(
  req: RequestPurchaseOrderChangesReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(purchaseOrdersRoutes.requestPurchaseOrderChanges, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.error(error);
        return {
          status: "ERROR",
          msg: "Could not request purchase order changes",
        };
      }
    );
}
