import { Box, InputAdornment, TextField, Typography } from "@material-ui/core";
import ArchivePurchaseOrderModal from "components/PurchaseOrder/v2/ArchivePurchaseOrderModal";
import BankPurchaseOrdersDataGrid from "components/PurchaseOrder/v2/BankPurchaseOrdersDataGrid";
import SecondaryButton from "components/Shared/Button/SecondaryButton";
import Can from "components/Shared/Can";
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
import { useNavigate } from "react-router-dom";

export default function BankPurchaseOrdersReadyForFinancingTab() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isUnArchiveModalOpen, setIsUnArchiveModalOpen] = useState(false);

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
      navigate(
        getBankCompanyRoute(customerId, BankCompanyRouteEnum.PurchaseOrders)
      ),
    [navigate]
  );

  return (
    <Box mt={3}>
      {isUnArchiveModalOpen && (
        <ArchivePurchaseOrderModal
          action={Action.ReopenPurchaseOrders}
          purchaseOrder={selectedPurchaseOrder}
          handleClose={() => {
            setSelectedPurchaseOrderIds([]);
            setIsUnArchiveModalOpen(false);
          }}
        />
      )}
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
            <SecondaryButton
              isDisabled={!selectedPurchaseOrder}
              text={"Unarchive"}
              onClick={() => setIsUnArchiveModalOpen(true)}
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
        <BankPurchaseOrdersDataGrid
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
