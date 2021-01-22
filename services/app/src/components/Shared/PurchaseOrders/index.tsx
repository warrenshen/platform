import { Box, Button } from "@material-ui/core";
import Can from "components/Shared/Can";
import CreateUpdatePurchaseOrderModal from "components/Shared/PurchaseOrders/CreateUpdatePurchaseOrderModal";
import ListPurchaseOrders from "components/Shared/PurchaseOrders/ListPurchaseOrders";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { useListPurchaseOrdersQuery } from "generated/graphql";
import { ActionType } from "lib/ActionType";
import { Action } from "lib/auth/rbac-rules";
import { useContext, useState } from "react";

function PurchaseOrders() {
  const {
    user: { companyId },
  } = useContext(CurrentUserContext);

  const { data, refetch } = useListPurchaseOrdersQuery({
    variables: {
      company_id: companyId,
    },
  });

  const purchaseOrders = data?.purchase_orders || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetPurchaseOrderId, setTargetPurchaseOrderId] = useState("");

  const handleEditPurchaseOrder = (purchaseOrderId: string) => {
    setTargetPurchaseOrderId(purchaseOrderId);
    setIsModalOpen(true);
  };

  return (
    <Box display="flex" flexDirection="column">
      {isModalOpen && (
        <CreateUpdatePurchaseOrderModal
          actionType={
            targetPurchaseOrderId === "" ? ActionType.New : ActionType.Update
          }
          purchaseOrderId={targetPurchaseOrderId}
          handleClose={() => {
            setTargetPurchaseOrderId("");
            refetch();
            setIsModalOpen(false);
          }}
        ></CreateUpdatePurchaseOrderModal>
      )}
      <Box pb={2} display="flex" flexDirection="row-reverse">
        <Can perform={Action.AddPurchaseOrders}>
          <Button
            onClick={() => setIsModalOpen(true)}
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
      ></ListPurchaseOrders>
    </Box>
  );
}

export default PurchaseOrders;
