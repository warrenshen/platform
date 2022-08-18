import {
  Box,
  Button,
  Theme,
  Typography,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import ArchivePurchaseOrderModal from "components/PurchaseOrder/ArchivePurchaseOrderModal";
import EditFinancialRequestPurchaseOrderModal from "components/PurchaseOrder/EditFinancialRequestPurchaseOrderModal";
import ArchivePurchaseOrderModalNew from "components/PurchaseOrder/v2/ArchivePurchaseOrderModalNew";
import CreateUpdatePurchaseOrderModalNew from "components/PurchaseOrder/v2/CreateUpdatePurchaseOrderModalNew";
import PurchaseOrdersDataGridNew from "components/PurchaseOrder/v2/PurchaseOrdersDataGridNew";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import {
  Companies,
  PurchaseOrderNewFragment,
  PurchaseOrders,
  useGetOpenPurchaseOrdersByCompanyIdNewQuery,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { submitPurchaseOrderMutation } from "lib/api/purchaseOrders";
import { Action } from "lib/auth/rbac-rules";
import {
  ActionType,
  NewPurchaseOrderStatus,
  NotReadyNewPurchaseOrderStatuses,
  ProductTypeEnum,
} from "lib/enum";
import { useMemo, useState } from "react";
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
}

export default function CustomerPurchaseOrdersOpenTabNew({
  companyId,
  productType,
}: Props) {
  const classes = useStyles();
  const snackbar = useSnackbar();

  const { data, error, refetch } = useGetOpenPurchaseOrdersByCompanyIdNewQuery({
    fetchPolicy: "network-only",
    variables: {
      company_id: companyId,
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const purchaseOrders = useMemo(
    () => data?.purchase_orders || [],
    [data?.purchase_orders]
  );

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
  const approvedPurchaseOrders = useMemo(
    () => purchaseOrders.filter((purchaseOrder) => !!purchaseOrder.approved_at),
    [purchaseOrders]
  );
  const notApprovedPurchaseOrders = useMemo(
    () => purchaseOrders.filter((purchaseOrder) => !purchaseOrder.approved_at),
    [purchaseOrders]
  );

  const [
    selectedApprovedPurchaseOrderIds,
    setSelectedApprovedPurchaseOrderIds,
  ] = useState<PurchaseOrders["id"][]>([]);

  const selectedApprovedPurchaseOrder = useMemo(
    () =>
      selectedApprovedPurchaseOrderIds.length === 1
        ? approvedPurchaseOrders.find(
            (approvedPurchaseOrder) =>
              approvedPurchaseOrder.id === selectedApprovedPurchaseOrderIds[0]
          )
        : null,
    [approvedPurchaseOrders, selectedApprovedPurchaseOrderIds]
  );

  const handleSelectApprovedPurchaseOrders = useMemo(
    () => (purchaseOrders: PurchaseOrderNewFragment[]) =>
      setSelectedApprovedPurchaseOrderIds(
        purchaseOrders.map((purchaseOrder) => purchaseOrder.id)
      ),
    [setSelectedApprovedPurchaseOrderIds]
  );

  const [submitPurchaseOrder, { loading: isSubmitPurchaseOrderLoading }] =
    useCustomMutation(submitPurchaseOrderMutation);

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
      refetch();
      setSelectedNotApprovedPurchaseOrdersMap({});
    }
  };

  const isFormLoading = isSubmitPurchaseOrderLoading;

  return (
    <Container>
      <Box flex={1} display="flex" flexDirection="column" width="100%">
        <Box className={classes.sectionSpace} />
        <Typography variant="h6">Not Ready to Request Financing New</Typography>
        <Box my={2} display="flex" flexDirection="row-reverse">
          {(selectedNotApprovedPurchaseOrdersMap.hasOwnProperty(
            NewPurchaseOrderStatus.Draft
          ) ||
            selectedNotApprovedPurchaseOrdersMap.hasOwnProperty(
              NewPurchaseOrderStatus.PendingApprovalByVendor
            )) && (
            <Can perform={Action.EditPurchaseOrders}>
              <Box mr={2}>
                <Button
                  disabled={!selectedNotApprovedPurchaseOrder || isFormLoading}
                  variant="contained"
                  color="primary"
                  onClick={handleSubmitPurchaseOrder}
                >
                  Submit to Vendor
                </Button>
              </Box>
            </Can>
          )}
          {Object.keys(selectedNotApprovedPurchaseOrdersMap).length > 0 && (
            <Can perform={Action.EditPurchaseOrders}>
              <Box mr={2}>
                <ModalButton
                  isDisabled={!selectedNotApprovedPurchaseOrder}
                  label={"Edit"}
                  modal={({ handleClose }) => (
                    <CreateUpdatePurchaseOrderModalNew
                      actionType={ActionType.Update}
                      companyId={companyId}
                      purchaseOrderId={selectedNotApprovedPurchaseOrder?.id}
                      productType={productType}
                      handleClose={() => {
                        refetch();
                        handleClose();
                        setSelectedNotApprovedPurchaseOrdersMap({});
                      }}
                    />
                  )}
                />
              </Box>
            </Can>
          )}
          {Object.keys(selectedNotApprovedPurchaseOrdersMap).length > 0 && (
            <Can perform={Action.ArchivePurchaseOrders}>
              <Box mr={2}>
                <ModalButton
                  isDisabled={
                    Object.keys(selectedNotApprovedPurchaseOrdersMap).length >
                      1 || selectedNotApprovedPurchaseOrderIds.length > 1
                  }
                  label={"Archive"}
                  variant={"outlined"}
                  color="default"
                  modal={({ handleClose }) => (
                    <ArchivePurchaseOrderModalNew
                      purchaseOrder={selectedNotApprovedPurchaseOrder}
                      action={Action.ArchivePurchaseOrders}
                      handleClose={() => {
                        refetch();
                        handleClose();
                        setSelectedNotApprovedPurchaseOrdersMap({});
                      }}
                    />
                  )}
                />
              </Box>
            </Can>
          )}
        </Box>
        <Box>
          <PurchaseOrdersDataGridNew
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
          <Typography variant="h6">Ready to Request Financing</Typography>
          <Box my={2} display="flex" flexDirection="row-reverse">
            <Box mr={2}>
              <ModalButton
                isDisabled={!selectedApprovedPurchaseOrder}
                label={"Edit Financing Request"}
                variant={"outlined"}
                modal={({ handleClose }) => (
                  <EditFinancialRequestPurchaseOrderModal
                    purchaseOrderId={selectedApprovedPurchaseOrder?.id}
                    handleClose={() => {
                      refetch();
                      handleClose();
                      setSelectedApprovedPurchaseOrderIds([]);
                    }}
                  />
                )}
              />
            </Box>
            <Box mr={2}>
              <ModalButton
                isDisabled={!selectedApprovedPurchaseOrder}
                label={"Archive"}
                variant={"outlined"}
                modal={({ handleClose }) => (
                  <ArchivePurchaseOrderModal
                    purchaseOrderId={selectedApprovedPurchaseOrder?.id}
                    handleClose={() => {
                      refetch();
                      handleClose();
                      setSelectedApprovedPurchaseOrderIds([]);
                    }}
                  />
                )}
              />
            </Box>
          </Box>
          <PurchaseOrdersDataGridNew
            isCompanyVisible={false}
            purchaseOrders={approvedPurchaseOrders}
            isFilteringEnabled={true}
            selectedPurchaseOrderIds={selectedApprovedPurchaseOrderIds}
            handleSelectPurchaseOrders={handleSelectApprovedPurchaseOrders}
            selectablePurchaseOrderStatuses={NotReadyNewPurchaseOrderStatuses}
          />
        </Box>
      </Box>
    </Container>
  );
}