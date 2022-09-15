import { Box, InputAdornment, TextField, Typography } from "@material-ui/core";
import ReviewPurchaseOrderApproveModalNew from "components/PurchaseOrder/ReviewPurchaseOrderApproveModalNew";
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

export default function BankPurchaseOrdersReadyForFinancingTab() {
  const history = useHistory();
  const [searchQuery, setSearchQuery] = useState("");

  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isRequestChangesModalOpen, setIsRequestChangesModalOpen] =
    useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const { data, error } = useGetPurchaseOrdersByNewStatusSubscription({
    variables: {
      statuses: [
        NewPurchaseOrderStatus.Draft,
        NewPurchaseOrderStatus.PendingApprovalByVendor,
        NewPurchaseOrderStatus.ChangesRequestedByVendor,
        NewPurchaseOrderStatus.ChangesRequestedByBespoke,
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
      {!!selectedPurchaseOrder && isApproveModalOpen && (
        <ReviewPurchaseOrderApproveModalNew
          purchaseOrder={selectedPurchaseOrder}
          handleClose={() => setIsApproveModalOpen(false)}
          handleApproveSuccess={() => {}}
        />
      )}
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
        mb={2}
      >
        <Box>
          <Typography variant="h6">Not Ready for Financing</Typography>
        </Box>
        <Box display="flex" flexDirection="row-reverse">
          <Can perform={Action.ApprovePurchaseOrders}>
            <PrimaryButton
              isDisabled={!selectedPurchaseOrder}
              text={"Approve"}
              onClick={() => setIsApproveModalOpen(true)}
            />
          </Can>
          <Can perform={Action.ApprovePurchaseOrders}>
            <PrimaryButton
              isDisabled={!selectedPurchaseOrder}
              text={"Request Changes"}
              onClick={() => setIsRequestChangesModalOpen(true)}
            />
          </Can>
          <Can perform={Action.DeletePurchaseOrders}>
            <SecondaryWarningButton
              isDisabled={!selectedPurchaseOrder}
              text={"Reject completely"}
              onClick={() => setIsRejectModalOpen(true)}
            />
          </Can>
          <Can perform={Action.ArchivePurchaseOrders}>
            <SecondaryButton
              isDisabled={!selectedPurchaseOrder}
              text={"Archive"}
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
          isApprovedByVendor={false}
          isMultiSelectEnabled={true}
        />
      </Box>
    </Box>
  );
}
