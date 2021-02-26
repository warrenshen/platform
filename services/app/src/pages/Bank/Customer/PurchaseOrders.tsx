import { Box, Button } from "@material-ui/core";
import CreateUpdatePurchaseOrderModal from "components/PurchaseOrders/CreateUpdatePurchaseOrderModal";
import PurchaseOrdersDataGrid from "components/PurchaseOrders/PurchaseOrdersDataGrid";
import Can from "components/Shared/Can";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { usePurchaseOrdersByCompanyIdQuery } from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
import { ActionType } from "lib/enum";
import { useState, useContext } from "react";

interface Props {
  companyId: string;
}

function BankCustomerPurchaseOrdersSubpage({ companyId }: Props) {
  const {
    user: { role },
  } = useContext(CurrentUserContext);

  const { data, refetch, error } = usePurchaseOrdersByCompanyIdQuery({
    variables: {
      company_id: companyId,
    },
  });

  if (error) {
    window.console.log("Error querying purchase orders. Error: " + error);
  }

  const purchaseOrders = data?.purchase_orders || [];

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [targetPurchaseOrderId, setTargetPurchaseOrderId] = useState("");

  const handleEditPurchaseOrder = (purchaseOrderId: string) => {
    setTargetPurchaseOrderId(purchaseOrderId);
    setIsEditModalOpen(true);
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
            refetch();
            setIsEditModalOpen(false);
            setTargetPurchaseOrderId("");
          }}
        />
      )}
      <Box mb={2} display="flex" flexDirection="row-reverse">
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
      <PurchaseOrdersDataGrid
        isCompanyVisible={false}
        purchaseOrders={purchaseOrders}
        actionItems={
          check(role, Action.EditPurchaseOrderLoan) &&
          check(role, Action.ViewPurchaseOrdersActionMenu)
            ? [
                {
                  key: "edit-purchase-order",
                  label: "Edit",
                  handleClick: (params) =>
                    handleEditPurchaseOrder(params.row.data.id as string),
                },
              ]
            : []
        }
      />
    </Box>
  );
}

export default BankCustomerPurchaseOrdersSubpage;
