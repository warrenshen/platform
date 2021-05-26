import { Box } from "@material-ui/core";
import ApprovePurchaseOrderModal from "components/PurchaseOrder/ApprovePurchaseOrderModal";
import PurchaseOrdersDataGrid from "components/PurchaseOrder/PurchaseOrdersDataGrid";
import RejectPurchaseOrderModal from "components/PurchaseOrder/RejectPurchaseOrderModal";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import {
  PurchaseOrderFragment,
  PurchaseOrders,
  useGetNotConfirmedPurchaseOrdersSubscription,
} from "generated/graphql";
import { Action } from "lib/auth/rbac-rules";
import { useMemo, useState } from "react";

function BankPurchaseOrdersActiveTab() {
  const { data, error } = useGetNotConfirmedPurchaseOrdersSubscription();

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const purchaseOrders = useMemo(() => data?.purchase_orders || [], [
    data?.purchase_orders,
  ]);

  // Reverse Draft ACH - schedule section
  const [selectedPurchaseOrderIds, setSelectedPurchaseOrderIds] = useState<
    PurchaseOrders["id"]
  >([]);

  const selectedPurchaseOrder = useMemo(
    () =>
      selectedPurchaseOrderIds.length === 1
        ? purchaseOrders.find(
            (purchaseOrder) => purchaseOrder.id === selectedPurchaseOrderIds[0]
          )
        : null,
    [purchaseOrders, selectedPurchaseOrderIds]
  );

  const handleSelectPurchaseOrders = useMemo(
    () => (purchaseOrders: PurchaseOrderFragment[]) => {
      setSelectedPurchaseOrderIds(
        purchaseOrders.map((purchaseOrder) => purchaseOrder.id)
      );
    },
    [setSelectedPurchaseOrderIds]
  );

  return (
    <Box mt={3}>
      <Box display="flex" flexDirection="row-reverse" mb={2}>
        <Can perform={Action.ApprovePurchaseOrders}>
          <>
            <Box>
              <ModalButton
                isDisabled={selectedPurchaseOrderIds.length !== 1}
                label={"Approve PO"}
                modal={({ handleClose }) =>
                  selectedPurchaseOrder ? (
                    <ApprovePurchaseOrderModal
                      purchaseOrder={selectedPurchaseOrder}
                      handleClose={() => {
                        handleClose();
                        setSelectedPurchaseOrderIds([]);
                      }}
                    />
                  ) : null
                }
              />
            </Box>
            <Box mr={2}>
              <ModalButton
                isDisabled={selectedPurchaseOrderIds.length !== 1}
                label={"Reject PO"}
                modal={({ handleClose }) =>
                  selectedPurchaseOrder ? (
                    <RejectPurchaseOrderModal
                      purchaseOrderId={selectedPurchaseOrder.id}
                      handleClose={() => {
                        handleClose();
                        setSelectedPurchaseOrderIds([]);
                      }}
                    />
                  ) : null
                }
              />
            </Box>
          </>
        </Can>
      </Box>
      <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
        <PurchaseOrdersDataGrid
          isCompanyVisible
          isMultiSelectEnabled
          isExcelExport
          purchaseOrders={purchaseOrders}
          handleSelectPurchaseOrders={handleSelectPurchaseOrders}
        />
      </Box>
    </Box>
  );
}

export default BankPurchaseOrdersActiveTab;
