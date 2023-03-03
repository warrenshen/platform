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

export type SubmitPurchaseOrderReq = {
  variables: {
    purchase_order: PurchaseOrdersInsertInput;
  };
};

export async function submitPurchaseOrderToVendorMutation(
  req: SubmitPurchaseOrderReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(purchaseOrdersRoutes.submitToVendor, req.variables)
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

export type ArchivePurchaseOrderReq = {
  variables: {
    purchase_order_id: PurchaseOrders["id"];
  };
};

export async function archivePurchaseOrderMutation(
  req: ArchivePurchaseOrderReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(purchaseOrdersRoutes.archive, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.error(error);
        return {
          status: "ERROR",
          msg: "Could not archive purchase order",
        };
      }
    );
}

export type ArchivePurchaseOrderMultipleReq = {
  variables: {
    purchase_order_ids: PurchaseOrders["id"][];
  };
};

export async function archivePurchaseOrderMultipleMutation(
  req: ArchivePurchaseOrderMultipleReq
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
          msg: "Could not archive purchase order",
        };
      }
    );
}

export type UnarchivePurchaseOrderReq = {
  variables: {
    purchase_order_id: PurchaseOrders["id"];
  };
};

export async function unarchivePurchaseOrderMutation(
  req: UnarchivePurchaseOrderReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(purchaseOrdersRoutes.unarchive, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.error(error);
        return {
          status: "ERROR",
          msg: "Could not unarchive purchase order",
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
