import { Box, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import PurchaseOrderInfoCard from "components/PurchaseOrder/PurchaseOrderInfoCard";
import Modal from "components/Shared/Modal/Modal";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  PurchaseOrders,
  usePurchaseOrderQuery,
  UserRolesEnum,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { deletePurchaseOrderMutation } from "lib/api/purchaseOrders";
import { useContext } from "react";

interface Props {
  purchaseOrderId: PurchaseOrders["id"] | null;
  handleClose: () => void;
}

function DeletePurchaseOrderModal({ purchaseOrderId, handleClose }: Props) {
  const snackbar = useSnackbar();

  const {
    user: { role },
  } = useContext(CurrentUserContext);
  const isBankUser = role === UserRolesEnum.BankAdmin;

  const {
    data,
    loading: isExistingPurchaseOrderLoading,
  } = usePurchaseOrderQuery({
    variables: {
      id: purchaseOrderId,
    },
  });

  const purchaseOrder = data?.purchase_orders_by_pk || null;

  const [
    deletePurchaseOrder,
    { loading: isDeletePurchaseOrderLoading },
  ] = useCustomMutation(deletePurchaseOrderMutation);

  const handleClickSubmit = async () => {
    const response = await deletePurchaseOrder({
      variables: {
        purchase_order_id: purchaseOrderId,
      },
    });
    if (response.status !== "OK") {
      snackbar.showError(`Error! Message: ${response.msg}`);
    } else {
      snackbar.showSuccess("Purchase order deleted.");
      handleClose();
    }
  };

  const isDialogReady = !isExistingPurchaseOrderLoading;
  const isFormLoading = isDeletePurchaseOrderLoading;
  const isSubmitDisabled = !isDialogReady || isFormLoading;

  return isDialogReady ? (
    <Modal
      isPrimaryActionDisabled={isSubmitDisabled}
      title={"Delete Purchase Order"}
      primaryActionText={"Confirm"}
      handleClose={handleClose}
      handlePrimaryAction={handleClickSubmit}
    >
      <>
        {isBankUser && (
          <Box mt={2} mb={3}>
            <Alert severity="warning">
              <Typography variant="body1">
                {`Warning: you are deleting a purchase order on behalf of this
                customer (only bank admins can do this).`}
              </Typography>
            </Alert>
          </Box>
        )}
        <Box mb={2}>
          <Typography variant={"h6"}>
            Are you sure you want to delete the following purchase order? You
            cannot undo this action.
          </Typography>
        </Box>
        {purchaseOrder && (
          <PurchaseOrderInfoCard purchaseOrder={purchaseOrder} />
        )}
      </>
    </Modal>
  ) : null;
}

export default DeletePurchaseOrderModal;
