import { Box, TextField } from "@material-ui/core";
import ApprovePurchaseOrderModal from "components/PurchaseOrder/ApprovePurchaseOrderModal";
import BankPurchaseOrdersDataGrid from "components/PurchaseOrder/BankPurchaseOrdersDataGrid";
import DeletePurchaseOrderModal from "components/PurchaseOrder/DeletePurchaseOrderModal";
import IncompletePurchaseOrderModal from "components/PurchaseOrder/IncompletePurchaseOrderModal";
import RejectPurchaseOrderModal from "components/PurchaseOrder/RejectPurchaseOrderModal";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import {
  CustomerForBankFragment,
  PurchaseOrderFragment,
  PurchaseOrders,
  useGetNotConfirmedPurchaseOrdersSubscription,
} from "generated/graphql";
import { useFilterNotConfirmedPurchaseOrders } from "hooks/useFilterPurchaseOrders";
import { Action } from "lib/auth/rbac-rules";
import { BankCompanyRouteEnum, getBankCompanyRoute } from "lib/routes";
import { useMemo, useState } from "react";
import { useHistory } from "react-router-dom";

export default function BankPurchaseOrdersActiveTab() {
  const history = useHistory();
  const [searchQuery, setSearchQuery] = useState("");

  const { data, error } = useGetNotConfirmedPurchaseOrdersSubscription();

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const purchaseOrders = useFilterNotConfirmedPurchaseOrders(searchQuery, data);

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

  const handleClickCustomer = useMemo(
    () => (customerId: CustomerForBankFragment["id"]) =>
      history.push(
        getBankCompanyRoute(customerId, BankCompanyRouteEnum.PurchaseOrders)
      ),
    [history]
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
          <Can perform={Action.ApprovePurchaseOrders}>
            <>
              <Box>
                <ModalButton
                  dataCy="approve-po-button"
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
                  label={"Mark PO Incomplete"}
                  modal={({ handleClose }) =>
                    selectedPurchaseOrder ? (
                      <IncompletePurchaseOrderModal
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
          <Can perform={Action.DeletePurchaseOrders}>
            <Box mr={2}>
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
      <Box
        display="flex"
        flexDirection="column"
        data-cy="incomplete-purchase-orders-data-grid-container"
      >
        <BankPurchaseOrdersDataGrid
          purchaseOrders={purchaseOrders}
          selectedPurchaseOrderIds={selectedPurchaseOrderIds}
          handleClickCustomer={handleClickCustomer}
          handleSelectPurchaseOrders={handleSelectPurchaseOrders}
          isApprovedByVendor={false}
        />
      </Box>
    </Box>
  );
}
