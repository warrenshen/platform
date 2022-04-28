import { useMemo, useState } from "react";
import { BankCompanyRouteEnum, getBankCompanyRoute } from "lib/routes";
import { useHistory } from "react-router-dom";
import { Action } from "lib/auth/rbac-rules";
import { Box, TextField } from "@material-ui/core";
import DeletePurchaseOrderModal from "components/PurchaseOrder/DeletePurchaseOrderModal";
import PurchaseOrdersDataGrid from "components/PurchaseOrder/PurchaseOrdersDataGrid";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import {
  PurchaseOrderFragment,
  PurchaseOrders,
  useGetDraftPurchaseOrdersSubscription,
} from "generated/graphql";
import {
  useFilterDraftedPurchaseOrders,
  useFilterPurchaseOrdersBySelectedIds,
} from "hooks/useFilterPurchaseOrders";

export default function BankPurchaseOrdersDraftedTab() {
  const history = useHistory();
  const [searchQuery, setSearchQuery] = useState("");

  const { data, error } = useGetDraftPurchaseOrdersSubscription();

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const purchaseOrders = useFilterDraftedPurchaseOrders(searchQuery, data);

  const [selectedPurchaseOrderIds, setSelectedPurchaseOrderIds] = useState<
    PurchaseOrders["id"]
  >([]);

  const selectedPurchaseOrder = useFilterPurchaseOrdersBySelectedIds(
    purchaseOrders,
    selectedPurchaseOrderIds
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
            label="Search by PO number, customer name, or vendor name"
            value={searchQuery}
            onChange={({ target: { value } }) => setSearchQuery(value)}
            style={{ width: 430 }}
          />
        </Box>
        <Box display="flex" flexDirection="row-reverse">
          <Can perform={Action.DeletePurchaseOrders}>
            <Box>
              <ModalButton
                isDisabled={selectedPurchaseOrderIds.length !== 1}
                label={"Delete PO"}
                variant={"outlined"}
                modal={({ handleClose }) =>
                  selectedPurchaseOrder ? (
                    <DeletePurchaseOrderModal
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
          </Can>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column">
        <PurchaseOrdersDataGrid
          isBankNoteVisible
          isCompanyVisible
          isCustomerNoteVisible={false}
          purchaseOrders={purchaseOrders}
          selectedPurchaseOrderIds={selectedPurchaseOrderIds}
          handleClickCustomer={(customerId) =>
            history.push(
              getBankCompanyRoute(
                customerId,
                BankCompanyRouteEnum.PurchaseOrders
              )
            )
          }
          handleSelectPurchaseOrders={handleSelectPurchaseOrders}
        />
      </Box>
    </Box>
  );
}
