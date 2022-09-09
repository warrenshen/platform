import { Box, InputAdornment, TextField, Typography } from "@material-ui/core";
import ArchivePurchaseOrderModalNew from "components/PurchaseOrder/v2/ArchivePurchaseOrderModalNew";
import BankPurchaseOrdersDataGridNew from "components/PurchaseOrder/v2/BankPurchaseOrdersDataGridNew";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import {
  CustomerForBankFragment,
  PurchaseOrderFragment,
  PurchaseOrders,
  useGetPurchaseOrdersByNewStatusSubscription,
} from "generated/graphql";
import { useFilterConfirmedPurchaseOrders } from "hooks/useFilterPurchaseOrders";
import { SearchIcon } from "icons";
import { Action } from "lib/auth/rbac-rules";
import {
  NewPurchaseOrderStatus,
  ReadyNewPurchaseOrderStatuses,
} from "lib/enum";
import { BankCompanyRouteEnum, getBankCompanyRoute } from "lib/routes";
import { useMemo, useState } from "react";
import { useHistory } from "react-router-dom";

export default function BankPurchaseOrdersReadyForFinancingTab() {
  const history = useHistory();
  const [searchQuery, setSearchQuery] = useState("");

  const { data, error } = useGetPurchaseOrdersByNewStatusSubscription({
    variables: {
      statuses: [
        NewPurchaseOrderStatus.Archived,
        NewPurchaseOrderStatus.RejectedByVendor,
        NewPurchaseOrderStatus.RejectedByBespoke,
      ],
    },
  });

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
          <Typography variant="h6">Archived</Typography>
        </Box>
        <Box display="flex" flexDirection="row-reverse">
          <Can perform={Action.ReopenPurchaseOrders}>
            <ModalButton
              dataCy="archive-po-button"
              isDisabled={selectedPurchaseOrderIds.length !== 1}
              label={"Unarchive"}
              variant="outlined"
              color="default"
              modal={({ handleClose }) =>
                selectedPurchaseOrder ? (
                  <ArchivePurchaseOrderModalNew
                    action={Action.ReopenPurchaseOrders}
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
          isApprovedByVendor={false}
          isMultiSelectEnabled={true}
        />
      </Box>
    </Box>
  );
}
