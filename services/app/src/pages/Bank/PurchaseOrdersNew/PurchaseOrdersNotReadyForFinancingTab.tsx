import { Box, InputAdornment, TextField, Typography } from "@material-ui/core";
import ReviewPurchaseOrderApproveModal from "components/PurchaseOrder/ReviewPurchaseOrderApproveModal";
import ReviewPurchaseOrderRejectModal from "components/PurchaseOrder/ReviewPurchaseOrderRejectModal";
import ReviewPurchaseOrderRequestChangesModal from "components/PurchaseOrder/ReviewPurchaseOrderRequestChangesModal";
import ArchivePurchaseOrderModal from "components/PurchaseOrder/v2/ArchivePurchaseOrderModal";
import ArchivePurchaseOrderModalMultiple from "components/PurchaseOrder/v2/ArchivePurchaseOrderModalMultiple";
import BankPurchaseOrdersDataGrid from "components/PurchaseOrder/v2/BankPurchaseOrdersDataGrid";
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
  NotReadyNewPurchaseOrderStatuses,
} from "lib/enum";
import { BankCompanyRouteEnum, getBankCompanyRoute } from "lib/routes";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function BankPurchaseOrdersReadyForFinancingTab() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isArchiveModalMultipleOpen, setIsArchiveModalMultipleOpen] =
    useState(false);
  const [isRequestChangesModalOpen, setIsRequestChangesModalOpen] =
    useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const { data, error } = useGetPurchaseOrdersByNewStatusSubscription({
    variables: {
      statuses: [
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
      navigate(
        getBankCompanyRoute(customerId, BankCompanyRouteEnum.PurchaseOrders)
      ),
    [navigate]
  );

  return (
    <Box mt={3}>
      {!!selectedPurchaseOrder && isApproveModalOpen && (
        <ReviewPurchaseOrderApproveModal
          purchaseOrder={selectedPurchaseOrder}
          handleClose={() => setIsApproveModalOpen(false)}
          handleApproveSuccess={() => {}}
        />
      )}
      {isArchiveModalOpen && (
        <ArchivePurchaseOrderModal
          action={Action.ArchivePurchaseOrders}
          purchaseOrder={selectedPurchaseOrder}
          handleClose={() => {
            setSelectedPurchaseOrderIds([]);
            setIsArchiveModalOpen(false);
          }}
        />
      )}
      ,
      {isArchiveModalMultipleOpen && (
        <ArchivePurchaseOrderModalMultiple
          purchaseOrderIds={selectedPurchaseOrderIds}
          purchaseOrderNumbers={purchaseOrders
            .filter((purchaseOrder) =>
              selectedPurchaseOrderIds.includes(purchaseOrder.id)
            )
            .map((purchaseOrder) => purchaseOrder.order_number)}
          handleClose={() => {
            setSelectedPurchaseOrderIds([]);
            setIsArchiveModalMultipleOpen(false);
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
        <ReviewPurchaseOrderRejectModal
          purchaseOrderId={selectedPurchaseOrder.id}
          handleClose={() => setIsRejectModalOpen(false)}
          handleRejectSuccess={() => {}}
        />
      )}
      <Box>
        <Typography variant="h6">Not Ready for Financing</Typography>
      </Box>
      <Box
        width="100%"
        display="flex"
        flexDirection="row-reverse"
        alignItems="flex-end"
      >
        <Can perform={Action.ApprovePurchaseOrders}>
          <PrimaryButton
            dataCy={"approve-as-vendor-button"}
            isDisabled={
              !selectedPurchaseOrder ||
              selectedPurchaseOrder.new_purchase_order_status ===
                NewPurchaseOrderStatus.ChangesRequestedByBespoke ||
              selectedPurchaseOrder.new_purchase_order_status ===
                NewPurchaseOrderStatus.ChangesRequestedByVendor
            }
            text={"Approve as Vendor"}
            onClick={() => setIsApproveModalOpen(true)}
          />
        </Can>
        <Can perform={Action.ApprovePurchaseOrders}>
          <PrimaryButton
            dataCy={"request-changes-button"}
            isDisabled={
              !selectedPurchaseOrder ||
              selectedPurchaseOrder.new_purchase_order_status ===
                NewPurchaseOrderStatus.ChangesRequestedByBespoke ||
              selectedPurchaseOrder.new_purchase_order_status ===
                NewPurchaseOrderStatus.ChangesRequestedByVendor
            }
            text={"Request Changes"}
            onClick={() => setIsRequestChangesModalOpen(true)}
          />
        </Can>
        <Can perform={Action.DeletePurchaseOrders}>
          <SecondaryWarningButton
            dataCy={"reject-completely-button"}
            isDisabled={!selectedPurchaseOrder}
            text={"Reject completely"}
            onClick={() => setIsRejectModalOpen(true)}
          />
        </Can>
        <Can perform={Action.ArchivePurchaseOrders}>
          <SecondaryButton
            dataCy={"archive-button"}
            isDisabled={selectedPurchaseOrderIds.length === 0}
            text={"Archive"}
            onClick={() => {
              selectedPurchaseOrderIds.length === 1
                ? setIsArchiveModalOpen(true)
                : setIsArchiveModalMultipleOpen(true);
            }}
          />
        </Can>
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
          selectablePurchaseOrderStatuses={NotReadyNewPurchaseOrderStatuses}
          handleClickCustomer={handleClickCustomer}
          handleSelectPurchaseOrders={handleSelectPurchaseOrders}
          isApprovedByVendor={false}
          isMultiSelectEnabled={true}
        />
      </Box>
    </Box>
  );
}
