import { Box, Theme, createStyles, makeStyles } from "@material-ui/core";
import ArchivePurchaseOrderModal from "components/PurchaseOrder/v2/ArchivePurchaseOrderModal";
import ArchivePurchaseOrderModalMultiple from "components/PurchaseOrder/v2/ArchivePurchaseOrderModalMultiple";
import CreateUpdatePurchaseOrderModal from "components/PurchaseOrder/v2/CreateUpdatePurchaseOrderModal";
import ManagePurchaseOrderFinancingModal from "components/PurchaseOrder/v2/ManagePurchaseOrderFinancingModal";
import ManagePurchaseOrderFinancingModalMultiple from "components/PurchaseOrder/v2/ManagePurchaseOrderFinancingModalMultiple";
import PurchaseOrdersDataGrid from "components/PurchaseOrder/v2/PurchaseOrdersDataGrid";
import PrimaryButton from "components/Shared/Button/PrimaryButton";
import SecondaryButton from "components/Shared/Button/SecondaryButton";
import Can from "components/Shared/Can";
import { TextColor } from "components/Shared/Colors/GlobalColors";
import LinearFinancialSummaryOverview from "components/Shared/FinancialSummaries/LinearFinancialSummaryOverview";
import Text, { TextVariants } from "components/Shared/Text/Text";
import { CurrentCustomerContext } from "contexts/CurrentCustomerContext";
import {
  Companies,
  PurchaseOrderLimitedNewFragment,
  PurchaseOrderNewFragment,
  PurchaseOrders,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { submitPurchaseOrderToVendorMutation } from "lib/api/purchaseOrders";
import { Action } from "lib/auth/rbac-rules";
import {
  ActionType,
  NewPurchaseOrderStatus,
  NotReadyNewPurchaseOrderStatuses,
  ProductTypeEnum,
  ReadyNewPurchaseOrderStatuses,
} from "lib/enum";
import { partition } from "lodash";
import { useContext, useMemo, useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
`;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    sectionSpace: {
      height: theme.spacing(4),
    },
  })
);

interface Props {
  companyId: Companies["id"];
  productType: ProductTypeEnum;
  isActiveContract: boolean;
  purchaseOrders: PurchaseOrderLimitedNewFragment[];
  refetchPurchaseOrders: () => void;
}

export default function CustomerPurchaseOrdersActiveTab({
  companyId,
  productType,
  isActiveContract,
  purchaseOrders,
  refetchPurchaseOrders,
}: Props) {
  const classes = useStyles();
  const snackbar = useSnackbar();

  const { financialSummary } = useContext(CurrentCustomerContext);

  // Not approved POs
  const [
    selectedNotApprovedPurchaseOrdersMap,
    setSelectedNotApprovedPurchaseOrdersMap,
  ] = useState<{ [key in NewPurchaseOrderStatus]?: PurchaseOrders["id"][] }>(
    {}
  );
  const handleSelectPurchaseOrdersNew = useMemo(
    () => (purchaseOrders: PurchaseOrderNewFragment[]) => {
      const selectedPurchaseOrdersMap = purchaseOrders.reduce((accum, elem) => {
        const purchaseOrderStatus = elem.new_purchase_order_status as string;
        if (accum.hasOwnProperty(purchaseOrderStatus)) {
          accum[purchaseOrderStatus].push(elem.id);
          return accum;
        } else {
          accum[purchaseOrderStatus] = [elem.id];
          return accum;
        }
      }, {} as any);
      setSelectedNotApprovedPurchaseOrdersMap(selectedPurchaseOrdersMap);
    },
    []
  );

  const selectedNotApprovedPurchaseOrderIds = useMemo(
    () => Object.values(selectedNotApprovedPurchaseOrdersMap).flat(),
    [selectedNotApprovedPurchaseOrdersMap]
  );

  const selectedNotApprovedPurchaseOrder = useMemo(
    () =>
      selectedNotApprovedPurchaseOrderIds.length === 1
        ? purchaseOrders.find(
            (purchaseOrder) =>
              purchaseOrder.id === selectedNotApprovedPurchaseOrderIds[0]
          )
        : null,
    [purchaseOrders, selectedNotApprovedPurchaseOrderIds]
  );

  // Approved POs
  const [
    selectedApprovedPurchaseOrdersMap,
    setSelectedApprovedPurchaseOrdersMap,
  ] = useState<{ [key in NewPurchaseOrderStatus]?: PurchaseOrders["id"][] }>(
    {}
  );
  const handleSelectApprovedPurchaseOrdersNew = useMemo(
    () => (purchaseOrders: PurchaseOrderNewFragment[]) => {
      const selectedPurchaseOrdersMap = purchaseOrders.reduce((accum, elem) => {
        const purchaseOrderStatus = elem.new_purchase_order_status as string;
        if (accum.hasOwnProperty(purchaseOrderStatus)) {
          accum[purchaseOrderStatus].push(elem.id);
          return accum;
        } else {
          accum[purchaseOrderStatus] = [elem.id];
          return accum;
        }
      }, {} as any);
      setSelectedApprovedPurchaseOrdersMap(selectedPurchaseOrdersMap);
    },
    []
  );

  const selectedApprovedPurchaseOrderIds = useMemo(
    () => Object.values(selectedApprovedPurchaseOrdersMap).flat(),
    [selectedApprovedPurchaseOrdersMap]
  );

  const selectedApprovedPurchaseOrder = useMemo(
    () =>
      selectedApprovedPurchaseOrderIds.length === 1
        ? purchaseOrders.find(
            (purchaseOrder) =>
              purchaseOrder.id === selectedApprovedPurchaseOrderIds[0]
          )
        : null,
    [purchaseOrders, selectedApprovedPurchaseOrderIds]
  );

  const [approvedPurchaseOrders, notApprovedPurchaseOrders] = useMemo(() => {
    if (purchaseOrders) {
      return partition(
        purchaseOrders,
        (purchaseOrder) =>
          purchaseOrder.new_purchase_order_status &&
          ReadyNewPurchaseOrderStatuses.includes(
            purchaseOrder.new_purchase_order_status as NewPurchaseOrderStatus
          )
      );
    }
    return [[], []];
  }, [purchaseOrders]);

  const [
    isArchiveModalOpenForNotApprovedPurchaseOrders,
    setIsArchiveModalOpenForNotApprovedPurchaseOrders,
  ] = useState(false);
  const [
    isArchiveModalOpenForApprovedPurchaseOrders,
    setIsArchiveModalOpenForApprovedPurchaseOrders,
  ] = useState(false);
  const [isArchiveModalMultipleOpen, setIsArchiveModalMultipleOpen] =
    useState(false);
  const [
    isCreateUpdateModalOpenForNotApprovedPurchaseOrders,
    setIsCreateUpdateModalOpenForNotApprovedPurchaseOrders,
  ] = useState(false);
  const [
    isCreateUpdateModalOpenForApprovedPurchaseOrders,
    setIsCreateUpdateModalOpenForApprovedPurchaseOrders,
  ] = useState(false);
  const [isManagePOFinancingModalOpen, setIsManagePOFinancingModalOpen] =
    useState(false);
  const [
    isManagePOFinancingModalMultipleOpen,
    setIsManagePOFinancingModalMultipleOpen,
  ] = useState(false);

  const [submitPurchaseOrder, { loading: isSubmitPurchaseOrderLoading }] =
    useCustomMutation(submitPurchaseOrderToVendorMutation);

  const handleSubmitPurchaseOrder = async () => {
    const purchaseOrder = selectedNotApprovedPurchaseOrder;

    if (!purchaseOrder) {
      alert(
        "Developer error! Selected not approved purchase order is required."
      );
      return;
    }

    const response = await submitPurchaseOrder({
      variables: {
        purchase_order: purchaseOrder,
      },
    });

    if (response.status !== "OK") {
      snackbar.showError(
        `Could not submit purchase order to vendor. Error: ${response.msg}`
      );
    } else {
      snackbar.showSuccess(
        `Purchase order ${purchaseOrder.order_number} submitted to vendor for review.`
      );
      refetchPurchaseOrders();
      setSelectedNotApprovedPurchaseOrdersMap({});
    }
  };

  const isFormLoading = isSubmitPurchaseOrderLoading;

  return (
    <Container>
      <Box mt={3}>
        <LinearFinancialSummaryOverview
          adjustedTotalLimit={financialSummary?.adjusted_total_limit || null}
          availableLimit={financialSummary?.available_limit || null}
        />
      </Box>
      {isArchiveModalOpenForNotApprovedPurchaseOrders && (
        <ArchivePurchaseOrderModal
          action={Action.ArchivePurchaseOrders}
          purchaseOrder={selectedNotApprovedPurchaseOrder}
          handleClose={() => {
            refetchPurchaseOrders();
            setSelectedNotApprovedPurchaseOrdersMap({});
            setIsArchiveModalOpenForNotApprovedPurchaseOrders(false);
          }}
        />
      )}
      {isArchiveModalOpenForApprovedPurchaseOrders && (
        <ArchivePurchaseOrderModal
          action={Action.ArchivePurchaseOrders}
          purchaseOrder={selectedApprovedPurchaseOrder}
          handleClose={() => {
            refetchPurchaseOrders();
            setSelectedApprovedPurchaseOrdersMap({});
            setIsArchiveModalOpenForApprovedPurchaseOrders(false);
          }}
        />
      )}
      {isArchiveModalMultipleOpen && (
        <ArchivePurchaseOrderModalMultiple
          purchaseOrderIds={[
            ...selectedApprovedPurchaseOrderIds,
            ...selectedNotApprovedPurchaseOrderIds,
          ]}
          purchaseOrderNumbers={purchaseOrders
            .filter((purchaseOrder) =>
              [
                ...selectedApprovedPurchaseOrderIds,
                ...selectedNotApprovedPurchaseOrderIds,
              ].includes(purchaseOrder.id)
            )
            .map((purchaseOrder) => purchaseOrder.order_number)}
          handleClose={() => {
            refetchPurchaseOrders();
            setSelectedApprovedPurchaseOrdersMap({});
            setSelectedNotApprovedPurchaseOrdersMap({});
            setIsArchiveModalMultipleOpen(false);
          }}
        />
      )}
      {isCreateUpdateModalOpenForNotApprovedPurchaseOrders && (
        <CreateUpdatePurchaseOrderModal
          actionType={ActionType.Update}
          purchaseOrderId={selectedNotApprovedPurchaseOrder?.id}
          companyId={companyId}
          productType={productType}
          handleClose={() => {
            refetchPurchaseOrders();
            setSelectedNotApprovedPurchaseOrdersMap({});
            setIsCreateUpdateModalOpenForNotApprovedPurchaseOrders(false);
          }}
        />
      )}
      {isCreateUpdateModalOpenForApprovedPurchaseOrders && (
        <CreateUpdatePurchaseOrderModal
          actionType={ActionType.Update}
          purchaseOrderId={selectedApprovedPurchaseOrder?.id}
          companyId={companyId}
          productType={productType}
          handleClose={() => {
            refetchPurchaseOrders();
            setSelectedNotApprovedPurchaseOrdersMap({});
            setIsCreateUpdateModalOpenForApprovedPurchaseOrders(false);
          }}
        />
      )}
      {isManagePOFinancingModalOpen && (
        <ManagePurchaseOrderFinancingModal
          companyId={companyId}
          purchaseOrderId={selectedApprovedPurchaseOrder?.id}
          handleClose={() => {
            refetchPurchaseOrders();
            setSelectedApprovedPurchaseOrdersMap({});
            setIsManagePOFinancingModalOpen(false);
          }}
        />
      )}
      {isManagePOFinancingModalMultipleOpen && (
        <ManagePurchaseOrderFinancingModalMultiple
          companyId={companyId}
          purchaseOrderIds={selectedApprovedPurchaseOrderIds}
          handleClose={() => {
            refetchPurchaseOrders();
            setSelectedApprovedPurchaseOrdersMap({});
            setIsManagePOFinancingModalMultipleOpen(false);
          }}
        />
      )}

      <Box flex={1} display="flex" flexDirection="column" width="100%">
        <Box display="flex" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <Text
              isDatagridCheckboxSelected={
                selectedNotApprovedPurchaseOrderIds.length > 0
              }
              textVariant={TextVariants.ParagraphLead}
              color={TextColor}
            >
              Not Ready to Request Financing
            </Text>
          </Box>
          <Box my={2} display="flex" flexDirection="row-reverse">
            {(selectedNotApprovedPurchaseOrdersMap.hasOwnProperty(
              NewPurchaseOrderStatus.Draft
            ) ||
              selectedNotApprovedPurchaseOrdersMap.hasOwnProperty(
                NewPurchaseOrderStatus.PendingApprovalByVendor
              )) && (
              <Can perform={Action.EditPurchaseOrders}>
                <PrimaryButton
                  dataCy={"submit-to-vendor-button"}
                  isDisabled={
                    !selectedNotApprovedPurchaseOrder ||
                    isFormLoading ||
                    !isActiveContract
                  }
                  text={"Submit to Vendor"}
                  onClick={handleSubmitPurchaseOrder}
                />
              </Can>
            )}
            {Object.keys(selectedNotApprovedPurchaseOrdersMap).length > 0 && (
              <Can perform={Action.EditPurchaseOrders}>
                <PrimaryButton
                  dataCy={"edit-not-ready-po-button"}
                  isDisabled={
                    !selectedNotApprovedPurchaseOrder || !isActiveContract
                  }
                  text={"Edit"}
                  onClick={() =>
                    setIsCreateUpdateModalOpenForNotApprovedPurchaseOrders(true)
                  }
                />
              </Can>
            )}
            {Object.keys(selectedNotApprovedPurchaseOrdersMap).length > 0 && (
              <Can perform={Action.ArchivePurchaseOrders}>
                <SecondaryButton
                  dataCy={"archive-not-ready-po-button"}
                  isDisabled={
                    selectedNotApprovedPurchaseOrderIds.length === 0 ||
                    !isActiveContract
                  }
                  text={"Archive"}
                  onClick={() => {
                    selectedApprovedPurchaseOrder
                      ? setIsArchiveModalOpenForNotApprovedPurchaseOrders(true)
                      : setIsArchiveModalMultipleOpen(true);
                  }}
                />
              </Can>
            )}
          </Box>
        </Box>
        <Box data-cy="not-ready-to-request-financing-data-grid">
          <PurchaseOrdersDataGrid
            isApprovedByVendor={false}
            isCompanyVisible={false}
            isFilteringEnabled={true}
            purchaseOrders={notApprovedPurchaseOrders}
            selectedPurchaseOrderIds={selectedNotApprovedPurchaseOrderIds}
            selectablePurchaseOrderStatuses={NotReadyNewPurchaseOrderStatuses}
            handleSelectPurchaseOrders={handleSelectPurchaseOrdersNew}
          />
        </Box>
        <Box className={classes.sectionSpace} />
        <Box
          display="flex"
          flexDirection="column"
          data-cy="ready-to-request-purchase-order-data-grid"
        >
          <Box display="flex" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <Text
                isDatagridCheckboxSelected={
                  selectedApprovedPurchaseOrderIds.length > 0
                }
                textVariant={TextVariants.ParagraphLead}
                color={TextColor}
              >
                Ready to Request Financing
              </Text>
            </Box>
            <Box my={2} display="flex" flexDirection="row-reverse">
              {selectedApprovedPurchaseOrdersMap.hasOwnProperty(
                NewPurchaseOrderStatus.ReadyToRequestFinancing
              ) && (
                <Can perform={Action.FundPurchaseOrders}>
                  {selectedApprovedPurchaseOrder ? (
                    <PrimaryButton
                      dataCy={"request-financing-button"}
                      isDisabled={
                        Object.keys(selectedApprovedPurchaseOrdersMap).length >
                          1 || !isActiveContract
                      }
                      text={"Request Financing"}
                      onClick={() => setIsManagePOFinancingModalOpen(true)}
                    />
                  ) : (
                    <PrimaryButton
                      dataCy={"request-financing-button"}
                      isDisabled={
                        Object.keys(selectedApprovedPurchaseOrdersMap).length >
                          1 || !isActiveContract
                      }
                      text={"Request Financing"}
                      onClick={() =>
                        setIsManagePOFinancingModalMultipleOpen(true)
                      }
                    />
                  )}
                </Can>
              )}
              {(selectedApprovedPurchaseOrdersMap.hasOwnProperty(
                NewPurchaseOrderStatus.FinancingPendingApproval
              ) ||
                selectedApprovedPurchaseOrdersMap.hasOwnProperty(
                  NewPurchaseOrderStatus.FinancingRequestApproved
                )) && (
                <Can perform={Action.FundPurchaseOrders}>
                  <PrimaryButton
                    dataCy={"edit-financing-request-button"}
                    isDisabled={
                      !(
                        selectedApprovedPurchaseOrder &&
                        (selectedApprovedPurchaseOrder.new_purchase_order_status ===
                          NewPurchaseOrderStatus.FinancingPendingApproval ||
                          NewPurchaseOrderStatus.FinancingRequestApproved)
                      ) || !isActiveContract
                    }
                    text={"Edit Financing"}
                    onClick={() => setIsManagePOFinancingModalOpen(true)}
                  />
                </Can>
              )}
              {selectedApprovedPurchaseOrdersMap.hasOwnProperty(
                NewPurchaseOrderStatus.ChangesRequestedByBespoke
              ) && (
                <Can perform={Action.EditPurchaseOrders}>
                  <PrimaryButton
                    dataCy={"edit-changes-requested-po-button"}
                    isDisabled={
                      !selectedApprovedPurchaseOrder || !isActiveContract
                    }
                    text={"Edit"}
                    onClick={() =>
                      setIsCreateUpdateModalOpenForApprovedPurchaseOrders(true)
                    }
                  />
                </Can>
              )}
              {Object.keys(selectedApprovedPurchaseOrdersMap).length > 0 && (
                <Can perform={Action.ArchivePurchaseOrders}>
                  <SecondaryButton
                    dataCy={"archive-ready-po-button"}
                    isDisabled={
                      selectedApprovedPurchaseOrderIds.length === 0 ||
                      !isActiveContract
                    }
                    text={"Archive"}
                    onClick={() => {
                      selectedApprovedPurchaseOrder
                        ? setIsArchiveModalOpenForApprovedPurchaseOrders(true)
                        : setIsArchiveModalMultipleOpen(true);
                    }}
                  />
                </Can>
              )}
            </Box>
          </Box>
          <Box data-cy="ready-to-request-financing-data-grid">
            <PurchaseOrdersDataGrid
              dataCy={"ready-to-request-financing-purchase-order-data-grid"}
              isCompanyVisible={false}
              purchaseOrders={approvedPurchaseOrders}
              isFilteringEnabled
              selectedPurchaseOrderIds={selectedApprovedPurchaseOrderIds}
              selectablePurchaseOrderStatuses={ReadyNewPurchaseOrderStatuses}
              handleSelectPurchaseOrders={handleSelectApprovedPurchaseOrdersNew}
            />
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
