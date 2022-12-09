import { Box, InputAdornment, TextField, Typography } from "@material-ui/core";
import ReviewPurchaseOrderRejectModalNew from "components/PurchaseOrder/ReviewPurchaseOrderRejectModalNew";
import ReviewPurchaseOrderRequestChangesModal from "components/PurchaseOrder/ReviewPurchaseOrderRequestChangesModal";
import ArchivePurchaseOrderModalMultiple from "components/PurchaseOrder/v2/ArchivePurchaseOrderModalMultiple";
import ArchivePurchaseOrderModalNew from "components/PurchaseOrder/v2/ArchivePurchaseOrderModalNew";
import BankPurchaseOrdersDataGridNew from "components/PurchaseOrder/v2/BankPurchaseOrdersDataGridNew";
import CreateUpdatePurchaseOrderModalNew from "components/PurchaseOrder/v2/CreateUpdatePurchaseOrderModalNew";
import PrimaryButton from "components/Shared/Button/PrimaryButton";
import SecondaryButton from "components/Shared/Button/SecondaryButton";
import SecondaryWarningButton from "components/Shared/Button/SecondaryWarningButton";
import Can from "components/Shared/Can";
import {
  CustomerForBankFragment,
  PurchaseOrderFragment,
  PurchaseOrders,
  useGetMostRecentFinancialSummaryAndContractByCompanyIdQuery,
  useGetPurchaseOrdersByNewStatusSubscription,
} from "generated/graphql";
import { useFilterConfirmedPurchaseOrders } from "hooks/useFilterPurchaseOrders";
import { SearchIcon } from "icons";
import { Action } from "lib/auth/rbac-rules";
import {
  ActionType,
  NewPurchaseOrderStatus,
  ProductTypeEnum,
  ReadyNewPurchaseOrderStatuses,
} from "lib/enum";
import { BankCompanyRouteEnum, getBankCompanyRoute } from "lib/routes";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function BankPurchaseOrdersReadyForFinancingTab() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isArchiveModalMultipleOpen, setIsArchiveModalMultipleOpen] =
    useState(false);
  const [isRequestChangesModalOpen, setIsRequestChangesModalOpen] =
    useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isCreateUpdateModalOpen, setIsCreateUpdateModalOpen] = useState(false);

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
      navigate(
        getBankCompanyRoute(customerId, BankCompanyRouteEnum.PurchaseOrders)
      ),
    [navigate]
  );

  const {
    data: mostRecentFinancialSummary,
    error: mostRecentFinancialSummaryError,
  } = useGetMostRecentFinancialSummaryAndContractByCompanyIdQuery({
    skip: !selectedPurchaseOrder || !selectedPurchaseOrder?.company_id,
    variables: {
      companyId: selectedPurchaseOrder?.company_id,
    },
  });

  if (mostRecentFinancialSummaryError) {
    console.error({ mostRecentFinancialSummaryError });
    alert(
      `Error in query (details in console): ${mostRecentFinancialSummaryError.message}`
    );
  }

  const productType =
    mostRecentFinancialSummary?.financial_summaries?.[0]?.product_type;

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
        <ReviewPurchaseOrderRejectModalNew
          purchaseOrderId={selectedPurchaseOrder.id}
          handleClose={() => setIsRejectModalOpen(false)}
          handleRejectSuccess={() => {}}
        />
      )}
      {!!selectedPurchaseOrder && productType && isCreateUpdateModalOpen && (
        <CreateUpdatePurchaseOrderModalNew
          actionType={ActionType.Update}
          purchaseOrderId={selectedPurchaseOrder.id}
          companyId={selectedPurchaseOrder.company_id}
          productType={productType as ProductTypeEnum}
          handleClose={() => {
            setIsCreateUpdateModalOpen(false);
          }}
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
          <Typography variant="h6">Ready for Financing</Typography>
        </Box>
        <Box display="flex" flexDirection="row-reverse">
          <Can perform={Action.ApprovePurchaseOrders}>
            <PrimaryButton
              isDisabled={!selectedPurchaseOrder}
              text={"Request Changes"}
              onClick={() => setIsRequestChangesModalOpen(true)}
            />
          </Can>
          <Box mr={2} />
          <Can perform={Action.EditPurchaseOrders}>
            <PrimaryButton
              isDisabled={!selectedPurchaseOrder}
              text={"Edit PO"}
              onClick={() => setIsCreateUpdateModalOpen(true)}
            />
          </Can>
          <Box mr={2} />
          <Can perform={Action.DeletePurchaseOrders}>
            <SecondaryWarningButton
              isDisabled={!selectedPurchaseOrder}
              text={"Reject completely"}
              onClick={() => setIsRejectModalOpen(true)}
            />
          </Can>
          <Box mr={2} />
          <Can perform={Action.ArchivePurchaseOrders}>
            <SecondaryButton
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
