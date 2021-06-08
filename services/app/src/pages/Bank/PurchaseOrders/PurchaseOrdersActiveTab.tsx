import { Box, TextField } from "@material-ui/core";
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
import { filter } from "lodash";
import { useMemo, useState } from "react";

export default function BankPurchaseOrdersActiveTab() {
  const { data, error } = useGetNotConfirmedPurchaseOrdersSubscription();

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const [searchQuery, setSearchQuery] = useState("");

  const purchaseOrders = useMemo(() => {
    const filteredPurchaseOrders = filter(
      data?.purchase_orders || [],
      (purchaseOrder) =>
        `${purchaseOrder.company.name} ${purchaseOrder.order_number}`
          .toLowerCase()
          .indexOf(searchQuery.toLowerCase()) >= 0
    );
    return filteredPurchaseOrders;
  }, [searchQuery, data?.purchase_orders]);

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
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-end"
        mb={2}
      >
        <Box display="flex">
          <TextField
            autoFocus
            label="Search by PO number or customer name"
            value={searchQuery}
            onChange={({ target: { value } }) => setSearchQuery(value)}
            style={{ width: 400 }}
          />
        </Box>
        <Box display="flex" flexDirection="row-reverse">
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
      </Box>
      <Box display="flex" flexDirection="column">
        <PurchaseOrdersDataGrid
          isBankNoteVisible
          isCompanyVisible
          isCustomerNoteVisible={false}
          isMultiSelectEnabled
          purchaseOrders={purchaseOrders}
          handleSelectPurchaseOrders={handleSelectPurchaseOrders}
        />
      </Box>
    </Box>
  );
}
