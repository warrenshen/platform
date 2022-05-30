import { Box, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import Modal from "components/Shared/Modal/Modal";
import {
  CurrentUserContext,
  isRoleBankUser,
} from "contexts/CurrentUserContext";
import { PurchaseOrderLimitedFragment } from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { closePurchaseOrderMutation } from "lib/api/purchaseOrders";
import { getCompanyDisplayName } from "lib/companies";
import { formatDateString } from "lib/date";
import { formatCurrency } from "lib/number";
import { useContext } from "react";

interface Props {
  purchaseOrder: PurchaseOrderLimitedFragment | null;
  handleClose: () => void;
}

export default function ClosePurchaseOrderModal({
  purchaseOrder,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();
  const purchaseOrderId = purchaseOrder?.id;

  const {
    user: { role },
  } = useContext(CurrentUserContext);
  const isBankUser = isRoleBankUser(role);

  const [closePurchaseOrder, { loading: isClosePurchaseOrderLoading }] =
    useCustomMutation(closePurchaseOrderMutation);

  const isPrimaryActionDisabled =
    isClosePurchaseOrderLoading || !purchaseOrderId;

  const handleClickClosePurchaseOrder = async () => {
    const response = await closePurchaseOrder({
      variables: {
        purchase_order_id: purchaseOrderId,
      },
    });
    if (response.status !== "OK") {
      snackbar.showError(
        `Could not close purchase order. Error: ${response.msg}`
      );
    } else {
      snackbar.showSuccess("Purchase order closed.");
      handleClose();
    }
  };

  return (
    <Modal
      dataCy={"close-purchase-order-modal"}
      isPrimaryActionDisabled={isPrimaryActionDisabled}
      title={`Close Purchase Order`}
      subtitle={purchaseOrder?.order_number}
      contentWidth={600}
      primaryActionText={"Submit Close Request"}
      handleClose={handleClose}
      handlePrimaryAction={handleClickClosePurchaseOrder}
    >
      {isBankUser && (
        <Box mt={2} mb={6}>
          <Alert severity="warning">
            <Typography variant="body1">
              {`Warning: you are closing a purchase order on behalf of this
                customer (only bank admins can do this).`}
            </Typography>
          </Alert>
        </Box>
      )}
      <Box mt={2} mb={6}>
        <Alert severity="warning">
          <Typography variant="body1">
            Performing this action will close a purchase order even if it is not
            100% funded. You may reverse this at any time using the "Reopen PO"
            button from the "Closed POs" tab.
          </Typography>
        </Alert>
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            Customer Name
          </Typography>
          <Typography variant={"body1"}>
            {purchaseOrder?.company?.name}
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            Vendor
          </Typography>
          <Typography variant={"body1"}>
            {getCompanyDisplayName(purchaseOrder?.vendor)}
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            Amount (Amount Funded)
          </Typography>
          <Typography variant={"body1"}>
            {`${formatCurrency(purchaseOrder?.amount)} (${formatCurrency(
              purchaseOrder?.amount_funded || 0.0
            )} funded)`}
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            PO Date
          </Typography>
          <Typography variant={"body1"}>
            {formatDateString(purchaseOrder?.order_date)}
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            Comments
          </Typography>
          <Typography variant={"body1"}>
            {purchaseOrder?.customer_note || "-"}
          </Typography>
        </Box>
      </Box>
    </Modal>
  );
}
