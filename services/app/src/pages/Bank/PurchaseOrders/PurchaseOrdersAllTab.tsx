import { Box, TextField } from "@material-ui/core";
import BankPurchaseOrdersDataGrid from "components/PurchaseOrder/BankPurchaseOrdersDataGrid";
import DeletePurchaseOrderModal from "components/PurchaseOrder/DeletePurchaseOrderModal";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import {
  PurchaseOrderFragment,
  PurchaseOrders,
  useGetPurchaseOrdersSubscription,
} from "generated/graphql";
import { useHistory } from "react-router-dom";
import { Action } from "lib/auth/rbac-rules";
import { BankCompanyRouteEnum, getBankCompanyRoute } from "lib/routes";
import { filter } from "lodash";
import { useMemo, useState } from "react";

export default function BankPurchaseOrdersAllTab() {
  const history = useHistory();

  const { data, error } = useGetPurchaseOrdersSubscription();

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
        <BankPurchaseOrdersDataGrid
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
          isApprovedByVendor={true}
        />
      </Box>
    </Box>
  );
}
