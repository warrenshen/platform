import { Box, InputAdornment, TextField, Typography } from "@material-ui/core";
import ArchivePurchaseOrderModalNew from "components/PurchaseOrder/v2/ArchivePurchaseOrderModalNew";
import BankPurchaseOrdersDataGridNew from "components/PurchaseOrder/v2/BankPurchaseOrdersDataGridNew";
import RejectPurchaseOrderModalNew from "components/PurchaseOrder/v2/RejectPurchaseOrderModalNew";
import RequestChangesPurchaseOrderModal from "components/PurchaseOrder/v2/RequestChangesPurchaseOrderModal";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import {
  CustomerForBankFragment,
  PurchaseOrderFragment,
  PurchaseOrders,
  useGetConfirmedPurchaseOrdersNewSubscription,
} from "generated/graphql";
import { useFilterConfirmedPurchaseOrders } from "hooks/useFilterPurchaseOrders";
import { SearchIcon } from "icons";
import { Action } from "lib/auth/rbac-rules";
import { ReadyNewPurchaseOrderStatuses } from "lib/enum";
import { BankCompanyRouteEnum, getBankCompanyRoute } from "lib/routes";
import { useMemo, useState } from "react";
import { useHistory } from "react-router-dom";

// STUB: Use appropriate query and filter for each tab
export default function BankPurchaseOrdersReadyForFinancingTab() {
  const history = useHistory();
  const [searchQuery, setSearchQuery] = useState("");

  const { data, error } = useGetConfirmedPurchaseOrdersNewSubscription();

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const purchaseOrders = useFilterConfirmedPurchaseOrders(searchQuery, data);

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
        mt={1}
        mb={4}
      >
        <Box>
          <Typography variant="h6">Ready for Financing</Typography>
        </Box>
        <Box display="flex" flexDirection="row-reverse">
          <Can perform={Action.ApprovePurchaseOrders}>
            <ModalButton
              dataCy="request-changes-po-button"
              isDisabled={selectedPurchaseOrderIds.length !== 1}
              label={"Request Changes"}
              modal={({ handleClose }) =>
                selectedPurchaseOrder ? (
                  <RequestChangesPurchaseOrderModal
                    purchaseOrderId={selectedPurchaseOrder.id}
                    handleClose={() => {
                      handleClose();
                      setSelectedPurchaseOrderIds([]);
                    }}
                  />
                ) : null
              }
            />
          </Can>
          <Box mr={2} />
          <Can perform={Action.DeletePurchaseOrders}>
            <ModalButton
              dataCy="reject-completely-po-button"
              isDisabled={selectedPurchaseOrderIds.length !== 1}
              label={"Reject Completely"}
              variant="outlined"
              color="secondary"
              modal={({ handleClose }) =>
                selectedPurchaseOrder ? (
                  <RejectPurchaseOrderModalNew
                    purchaseOrderId={selectedPurchaseOrder.id}
                    handleClose={() => {
                      handleClose();
                      setSelectedPurchaseOrderIds([]);
                    }}
                  />
                ) : null
              }
            />
          </Can>
          <Box mr={2} />
          <Can perform={Action.ArchivePurchaseOrders}>
            <ModalButton
              dataCy="archive-po-button"
              isDisabled={selectedPurchaseOrderIds.length !== 1}
              label={"Archive"}
              variant="outlined"
              color="default"
              modal={({ handleClose }) =>
                selectedPurchaseOrder ? (
                  <ArchivePurchaseOrderModalNew
                    action={Action.ArchivePurchaseOrders}
                    purchaseOrder={selectedPurchaseOrder}
                    handleClose={() => {
                      handleClose();
                      setSelectedPurchaseOrderIds([]);
                    }}
                  />
                ) : null
              }
            />
          </Can>
        </Box>
      </Box>
      <Box display="flex" mb={4}>
        <TextField
          autoFocus
          label="Search"
          value={searchQuery}
          onChange={({ target: { value } }) => setSearchQuery(value)}
          style={{ width: 430 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <Box
        display="flex"
        flexDirection="column"
        data-cy="incomplete-purchase-orders-data-grid-container"
      >
        <BankPurchaseOrdersDataGridNew
          purchaseOrders={purchaseOrders}
          selectedPurchaseOrderIds={selectedPurchaseOrderIds}
          selectablePurchaseOrderStatuses={ReadyNewPurchaseOrderStatuses}
          handleClickCustomer={handleClickCustomer}
          handleSelectPurchaseOrders={handleSelectPurchaseOrders}
          isApprovedByVendor={true}
          isMultiSelectEnabled={true}
        />
      </Box>
    </Box>
  );
}
