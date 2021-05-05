import {
  Box,
  Button,
  createStyles,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import CreateMultiplePurchaseOrdersLoansModal from "components/Loan/CreateMultiplePurchaseOrdersLoansModal";
import CreateUpdatePurchaseOrderLoanModal from "components/Loan/CreateUpdatePurchaseOrderLoanModal";
import DeletePurchaseOrderModal from "components/PurchaseOrder/DeletePurchaseOrderModal";
import CreateUpdatePurchaseOrderModal from "components/PurchaseOrders/CreateUpdatePurchaseOrderModal";
import PurchaseOrdersDataGrid from "components/PurchaseOrders/PurchaseOrdersDataGrid";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import {
  CurrentUserContext,
  isRoleBankUser,
} from "contexts/CurrentUserContext";
import {
  Companies,
  ProductTypeEnum,
  PurchaseOrderFragment,
  PurchaseOrders,
  useGetOpenPurchaseOrdersByCompanyIdQuery,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { submitPurchaseOrderMutation } from "lib/api/purchaseOrders";
import { Action } from "lib/auth/rbac-rules";
import { ActionType } from "lib/enum";
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
}

export default function CustomerPurchaseOrdersOpenTab({
  companyId,
  productType,
}: Props) {
  const classes = useStyles();
  const snackbar = useSnackbar();

  const {
    user: { role },
  } = useContext(CurrentUserContext);
  const isBankUser = isRoleBankUser(role);

  const { data, error, refetch } = useGetOpenPurchaseOrdersByCompanyIdQuery({
    fetchPolicy: "network-only",
    variables: {
      company_id: companyId,
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const purchaseOrders = useMemo(() => data?.purchase_orders || [], [
    data?.purchase_orders,
  ]);

  // Not approved POs
  const notApprovedPurchaseOrders = useMemo(
    () => purchaseOrders.filter((purchaseOrder) => !purchaseOrder.approved_at),
    [purchaseOrders]
  );

  const [
    selectedNotApprovedPurchaseOrderIds,
    setSelectedNotApprovedPurchaseOrderIds,
  ] = useState<PurchaseOrders["id"][]>([]);

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

  const handleSelectPurchaseOrders = useMemo(
    () => (purchaseOrders: PurchaseOrderFragment[]) =>
      setSelectedNotApprovedPurchaseOrderIds(
        purchaseOrders.map((purchaseOrder) => purchaseOrder.id)
      ),
    [setSelectedNotApprovedPurchaseOrderIds]
  );

  // Approved POs
  const approvedPurchaseOrders = useMemo(
    () => purchaseOrders.filter((purchaseOrder) => !!purchaseOrder.approved_at),
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
    () => (purchaseOrders: PurchaseOrderFragment[]) =>
      setSelectedApprovedPurchaseOrderIds(
        purchaseOrders.map((purchaseOrder) => purchaseOrder.id)
      ),
    [setSelectedApprovedPurchaseOrderIds]
  );

  const [
    submitPurchaseOrder,
    { loading: isSubmitPurchaseOrderLoading },
  ] = useCustomMutation(submitPurchaseOrderMutation);

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
      setSelectedNotApprovedPurchaseOrderIds([]);
    }
  };

  const isFormLoading = isSubmitPurchaseOrderLoading;

  return (
    <Container>
      <Box flex={1} display="flex" flexDirection="column" width="100%">
        <Box className={classes.sectionSpace} />
        <Typography variant="h6">Not Approved by Vendor Yet</Typography>
        <Box my={2} display="flex" flexDirection="row-reverse">
          <Can perform={Action.AddPurchaseOrders}>
            <ModalButton
              data-cy="create-purchase-order-button"
              isDisabled={!!selectedNotApprovedPurchaseOrder}
              label={"Create PO"}
              modal={({ handleClose }) => (
                <CreateUpdatePurchaseOrderModal
                  actionType={ActionType.New}
                  companyId={companyId}
                  purchaseOrderId={null}
                  handleClose={() => {
                    refetch();
                    handleClose();
                  }}
                />
              )}
            />
          </Can>
          <Can perform={Action.EditPurchaseOrders}>
            <Box mr={2}>
              <ModalButton
                isDisabled={!selectedNotApprovedPurchaseOrder}
                label={"Edit PO"}
                modal={({ handleClose }) => (
                  <CreateUpdatePurchaseOrderModal
                    actionType={ActionType.Update}
                    companyId={companyId}
                    purchaseOrderId={selectedNotApprovedPurchaseOrder?.id}
                    handleClose={() => {
                      refetch();
                      handleClose();
                      setSelectedNotApprovedPurchaseOrderIds([]);
                    }}
                  />
                )}
              />
            </Box>
          </Can>
          <Can perform={Action.EditPurchaseOrders}>
            <Box mr={2}>
              <Button
                disabled={!selectedNotApprovedPurchaseOrder || isFormLoading}
                variant="contained"
                color="primary"
                onClick={handleSubmitPurchaseOrder}
              >
                Submit PO to Vendor
              </Button>
            </Box>
          </Can>
          {selectedNotApprovedPurchaseOrder &&
            !selectedNotApprovedPurchaseOrder.requested_at && (
              <Can perform={Action.DeletePurchaseOrders}>
                <Box mr={2}>
                  <ModalButton
                    isDisabled={!selectedNotApprovedPurchaseOrder}
                    label={"Delete PO"}
                    variant={"outlined"}
                    modal={({ handleClose }) => (
                      <DeletePurchaseOrderModal
                        purchaseOrderId={selectedNotApprovedPurchaseOrderIds[0]}
                        handleClose={() => {
                          refetch();
                          handleClose();
                          setSelectedNotApprovedPurchaseOrderIds([]);
                        }}
                      />
                    )}
                  />
                </Box>
              </Can>
            )}
        </Box>
        <Box>
          <PurchaseOrdersDataGrid
            isCompanyVisible={false}
            isExcelExport={isBankUser}
            purchaseOrders={notApprovedPurchaseOrders}
            selectedPurchaseOrderIds={selectedNotApprovedPurchaseOrderIds}
            handleSelectPurchaseOrders={handleSelectPurchaseOrders}
          />
        </Box>
        <Box className={classes.sectionSpace} />
        <Box display="flex" flexDirection="column">
          <Typography variant="h6">
            Approved by Vendor & Ready to be Funded
          </Typography>
          <Box my={2} display="flex" flexDirection="row-reverse">
            <Can perform={Action.FundPurchaseOrders}>
              <Box>
                <ModalButton
                  isDisabled={!selectedApprovedPurchaseOrderIds.length}
                  label={"Fund PO"}
                  modal={({ handleClose }) => {
                    const handler = () => {
                      refetch();
                      handleClose();
                      setSelectedApprovedPurchaseOrderIds([]);
                    };
                    return selectedApprovedPurchaseOrderIds.length > 1 ? (
                      <CreateMultiplePurchaseOrdersLoansModal
                        artifactIds={selectedApprovedPurchaseOrderIds}
                        handleClose={handler}
                      />
                    ) : (
                      <CreateUpdatePurchaseOrderLoanModal
                        actionType={ActionType.New}
                        companyId={companyId}
                        productType={productType}
                        loanId={null}
                        artifactId={selectedApprovedPurchaseOrderIds[0]}
                        handleClose={handler}
                      />
                    );
                  }}
                />
              </Box>
            </Can>
            <Can perform={Action.EditPurchaseOrders}>
              <Box mr={2}>
                <ModalButton
                  isDisabled={!selectedApprovedPurchaseOrder}
                  label={"Edit PO"}
                  modal={({ handleClose }) => (
                    <CreateUpdatePurchaseOrderModal
                      actionType={ActionType.Update}
                      companyId={companyId}
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
            </Can>
          </Box>
          <PurchaseOrdersDataGrid
            isCompanyVisible={false}
            isExcelExport={isBankUser}
            purchaseOrders={approvedPurchaseOrders}
            selectedPurchaseOrderIds={selectedApprovedPurchaseOrderIds}
            handleSelectPurchaseOrders={handleSelectApprovedPurchaseOrders}
          />
        </Box>
      </Box>
    </Container>
  );
}
