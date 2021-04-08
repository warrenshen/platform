import { Box, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import Modal from "components/Shared/Modal/Modal";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  PurchaseOrders,
  PurchaseOrdersInsertInput,
  RequestStatusEnum,
  usePurchaseOrderQuery,
  UserRolesEnum,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { deletePurchaseOrderMutation } from "lib/api/purchaseOrders";
import { isNull, mergeWith } from "lodash";
import { useContext, useState } from "react";

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

  // Default PurchaseOrder for CREATE case.
  const newPurchaseOrder = {
    vendor_id: null,
    order_number: "",
    order_date: null,
    delivery_date: null,
    amount: null,
    is_cannabis: true,
    status: RequestStatusEnum.Drafted,
  } as PurchaseOrdersInsertInput;

  const [purchaseOrder, setPurchaseOrder] = useState(newPurchaseOrder);

  const { loading: isExistingPurchaseOrderLoading } = usePurchaseOrderQuery({
    variables: {
      id: purchaseOrderId,
    },
    onCompleted: (data) => {
      const existingPurchaseOrder = data?.purchase_orders_by_pk;
      if (existingPurchaseOrder) {
        setPurchaseOrder(
          mergeWith(newPurchaseOrder, existingPurchaseOrder, (a, b) =>
            isNull(b) ? a : b
          )
        );
      }
    },
  });

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
      </>
    </Modal>
  ) : null;
}

export default DeletePurchaseOrderModal;
