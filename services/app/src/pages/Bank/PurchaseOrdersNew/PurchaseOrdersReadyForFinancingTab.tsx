import { Box, InputAdornment, TextField, Typography } from "@material-ui/core";
import ReviewPurchaseOrderRejectModalNew from "components/PurchaseOrder/ReviewPurchaseOrderRejectModalNew";
import ReviewPurchaseOrderRequestChangesModal from "components/PurchaseOrder/ReviewPurchaseOrderRequestChangesModal";
import ArchivePurchaseOrderModalNew from "components/PurchaseOrder/v2/ArchivePurchaseOrderModalNew";
import BankPurchaseOrdersDataGridNew from "components/PurchaseOrder/v2/BankPurchaseOrdersDataGridNew";
import PrimaryButton from "components/Shared/Button/PrimaryButton";
import SecondaryButton from "components/Shared/Button/SecondaryButton";
import SecondaryWarningButton from "components/Shared/Button/SecondaryWarningButton";
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
import { useHistory } from "react-router-dom";

// STUB: Use appropriate query and filter for each tab
export default function BankPurchaseOrdersReadyForFinancingTab() {
  const history = useHistory();
  const [searchQuery, setSearchQuery] = useState("");

  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isRequestChangesModalOpen, setIsRequestChangesModalOpen] =
    useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const { data, error } = useGetPurchaseOrdersByNewStatusSubscription({
    variables: {
      statuses: [
        NewPurchaseOrderStatus.ReadyToRequestFinancing,
        NewPurchaseOrderStatus.FinancingPendingApproval,
        NewPurchaseOrderStatus.FinancingRequestApproved,
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
      {isArchiveModalOpen && (
        <ArchivePurchaseOrderModalNew
          action={Action.ArchivePurchaseOrders}
          purchaseOrder={selectedPurchaseOrder}
          handleClose={() => {
            setSelectedPurchaseOrderIds([]);
            setIsArchiveModalOpen(false);
          }}
        />
      )}
      {!!selectedPurchaseOrder && isRequestChangesModalOpen && (
        <ReviewPurchaseOrderRequestChangesModal
          purchaseOrderId={selectedPurchaseOrder.id}
          handleClose={() => setIsRequestChangesModalOpen(false)}
          handleRequestChangesSuccess={() => {}}
        />
      )}
      {!!selectedPurchaseOrder && isRejectModalOpen && (
        <ReviewPurchaseOrderRejectModalNew
          purchaseOrderId={selectedPurchaseOrder.id}
          handleClose={() => setIsRejectModalOpen(false)}
          handleRejectSuccess={() => {}}
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
          <Typography variant="h6">Ready for Financing</Typography>
        </Box>
        <Box display="flex" flexDirection="row-reverse">
          <Can perform={Action.ApprovePurchaseOrders}>
            <PrimaryButton
              isDisabled={!selectedPurchaseOrder}
              text={"Request Changes"}
              width={"184px"}
              height={"50px"}
              onClick={() => setIsRequestChangesModalOpen(true)}
            />
          </Can>
          <Box mr={2} />
          <Can perform={Action.DeletePurchaseOrders}>
            <SecondaryWarningButton
              isDisabled={!selectedPurchaseOrder}
              text={"Reject completely"}
              width={"184px"}
              height={"50px"}
              onClick={() => setIsRejectModalOpen(true)}
            />
          </Can>
          <Box mr={2} />
          <Can perform={Action.ArchivePurchaseOrders}>
            <SecondaryButton
              isDisabled={!selectedPurchaseOrder}
              text={"Archive"}
              width={"184px"}
              height={"50px"}
              onClick={() => setIsArchiveModalOpen(true)}
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
