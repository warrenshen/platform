import { Box, Button } from "@material-ui/core";
import Can from "components/Shared/Can";
import CreateUpdatePurchaseOrderModal from "components/Shared/PurchaseOrders/CreateUpdatePurchaseOrderModal";
import ViewPurchaseOrderModal from "components/Shared/PurchaseOrders/ViewPurchaseOrder/ViewPurchaseOrderModal";
import { useListPurchaseOrdersQuery } from "generated/graphql";
import useCompanyContext from "hooks/useCompanyContext";
import { ActionType } from "lib/ActionType";
import { Action } from "lib/auth/rbac-rules";
import { useState } from "react";
import ListPurchaseOrders from "./ListPurchaseOrders";

function PurchaseOrders() {
  const companyId = useCompanyContext();

  const { data, refetch, error } = useListPurchaseOrdersQuery({
    variables: {
      company_id: companyId,
    },
  });

  if (error) {
    window.console.log("Error querying purchase orders. Error: " + error);
  }

  const purchaseOrders = data?.purchase_orders || [];

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [targetPurchaseOrderId, setTargetPurchaseOrderId] = useState("");

  const handleEditPurchaseOrder = (purchaseOrderId: string) => {
    setTargetPurchaseOrderId(purchaseOrderId);
    setIsEditModalOpen(true);
  };

  const handleViewPurchaseOrder = (purchaseOrderId: string) => {
    setTargetPurchaseOrderId(purchaseOrderId);
    setIsViewModalOpen(true);
  };

  return (
    <Box flex={1} display="flex" flexDirection="column" width="100%">
      {isEditModalOpen && (
        <CreateUpdatePurchaseOrderModal
          actionType={
            targetPurchaseOrderId === "" ? ActionType.New : ActionType.Update
          }
          purchaseOrderId={targetPurchaseOrderId}
          handleClose={() => {
            setTargetPurchaseOrderId("");
            refetch();
            setIsEditModalOpen(false);
          }}
        ></CreateUpdatePurchaseOrderModal>
      )}
      {isViewModalOpen && (
        <ViewPurchaseOrderModal
          purchaseOrderId={targetPurchaseOrderId}
          handleClose={() => {
            setTargetPurchaseOrderId("");
            setIsViewModalOpen(false);
          }}
        ></ViewPurchaseOrderModal>
      )}
      <Box pb={2} display="flex" flexDirection="row-reverse">
        <Can perform={Action.AddPurchaseOrders}>
          <Button
            onClick={() => setIsEditModalOpen(true)}
            variant="contained"
            color="primary"
          >
            Create Purchase Order
          </Button>
        </Can>
      </Box>
      <ListPurchaseOrders
        purchaseOrders={purchaseOrders}
        handleEditPurchaseOrder={handleEditPurchaseOrder}
        handleViewPurchaseOrder={handleViewPurchaseOrder}
      ></ListPurchaseOrders>
    </Box>
  );
}

export default PurchaseOrders;
