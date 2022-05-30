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
import { reopenPurchaseOrderMutation } from "lib/api/purchaseOrders";
import { getCompanyDisplayName } from "lib/companies";
import { formatDateString } from "lib/date";
import { formatCurrency } from "lib/number";
import { useContext } from "react";

interface Props {
  purchaseOrder: PurchaseOrderLimitedFragment | null;
  handleClose: () => void;
}

export default function ReopenPurchaseOrderModal({
  purchaseOrder,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();
  const purchaseOrderId = purchaseOrder?.id;

  const {
    user: { role },
  } = useContext(CurrentUserContext);
  const isBankUser = isRoleBankUser(role);

  const [reopenPurchaseOrder, { loading: isReopenPurchaseOrderLoading }] =
    useCustomMutation(reopenPurchaseOrderMutation);

  const isPrimaryActionDisabled =
    isReopenPurchaseOrderLoading ||
    !purchaseOrderId ||
    purchaseOrder?.amount === purchaseOrder?.amount_funded;

  const handleClickClosePurchaseOrder = async () => {
    const response = await reopenPurchaseOrder({
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
      dataCy={"reopen-purchase-order-modal"}
      isPrimaryActionDisabled={isPrimaryActionDisabled}
      title={`Reopen Purchase Order`}
      subtitle={purchaseOrder?.order_number}
      contentWidth={600}
      primaryActionText={"Submit Reopen Request"}
      handleClose={handleClose}
      handlePrimaryAction={handleClickClosePurchaseOrder}
    >
      {isBankUser && (
        <Box mt={2} mb={6}>
          <Alert severity="warning">
            <Typography variant="body1">
              {`Warning: you are reopening a purchase order on behalf of this
                customer (only bank admins can do this).`}
            </Typography>
          </Alert>
        </Box>
      )}
      {!!purchaseOrder?.funded_at && (
        <Alert severity="warning">
          <Typography variant="body1">
            The purchase order you selected is already 100% funded. You may not
            reopen a 100% funded purchase order.
          </Typography>
        </Alert>
      )}
      {!purchaseOrder?.funded_at && (
        <Box mt={2} mb={6}>
          <Alert severity="warning">
            <Typography variant="body1">
              Performing this action will reopen a previously closed purchase
              order. You may only reopen a purchase order if it is not 100%
              funded.
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
              PO Closed Date
            </Typography>
            <Typography variant={"body1"}>
              {formatDateString(purchaseOrder?.closed_at)}
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
      )}
    </Modal>
  );
}
