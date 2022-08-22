import { Box, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import PurchaseOrderInfoCard from "components/PurchaseOrder/PurchaseOrderInfoCard";
import Modal from "components/Shared/Modal/Modal";
import {
  CurrentUserContext,
  isRoleBankUser,
} from "contexts/CurrentUserContext";
import {
  PurchaseOrders,
  useGetPurchaseOrderForCustomerQuery,
} from "generated/graphql";
import useSnackbar from "hooks/useSnackbar";
import { useContext } from "react";

interface Props {
  purchaseOrderId: PurchaseOrders["id"];
  handleClose: () => void;
}

// This will be the parent component
function EditFinancingRequestPurchaseOrderModal({
  purchaseOrderId,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();

  const {
    user: { role },
  } = useContext(CurrentUserContext);
  const isBankUser = isRoleBankUser(role);

  const { data, loading: isExistingPurchaseOrderLoading } =
    useGetPurchaseOrderForCustomerQuery({
      fetchPolicy: "network-only",
      variables: {
        id: purchaseOrderId,
      },
    });

  const purchaseOrder = data?.purchase_orders_by_pk || null;

  const handleClickSubmit = async () => {
    snackbar.showSuccess("Purchase order updated.");
  };

  const isDialogReady = !isExistingPurchaseOrderLoading;

  return isDialogReady ? (
    <Modal
      title={"Edit Financial Request Purchase Order"}
      primaryActionText={"Confirm"}
      handleClose={handleClose}
      handlePrimaryAction={handleClickSubmit}
    >
      <>
        {isBankUser && (
          <Box mt={2} mb={6}>
            <Alert severity="warning">
              <Typography variant="body1">
                {`Warning: you are editing a purchase order on behalf of this
                customer (only bank admins can do this).`}
              </Typography>
            </Alert>
          </Box>
        )}
        <Box mb={2}>
          <Typography variant={"h6"}>
            Are you sure you want to edit the following purchase order? You
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

export default EditFinancingRequestPurchaseOrderModal;
