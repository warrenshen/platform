import { Box, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import Modal from "components/Shared/Modal/Modal";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  PurchaseOrders,
  useGetPaymentQuery,
  UserRolesEnum,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { deleteRepaymentMutation } from "lib/api/payments";
import { formatCurrency } from "lib/currency";
import { formatDateString } from "lib/date";
import { PaymentMethodEnum, PaymentMethodToLabel } from "lib/enum";
import { useContext } from "react";

interface Props {
  paymentId: PurchaseOrders["id"] | null;
  handleClose: () => void;
}

function DeletePaymentModal({ paymentId, handleClose }: Props) {
  const snackbar = useSnackbar();

  const {
    user: { role },
  } = useContext(CurrentUserContext);
  const isBankUser = role === UserRolesEnum.BankAdmin;

  const { data, loading: isExistingPaymentLoading } = useGetPaymentQuery({
    fetchPolicy: "network-only",
    variables: {
      id: paymentId,
    },
  });

  const payment = data?.payments_by_pk || null;

  const [
    deletePayment,
    { loading: isDeleteRepaymentLoading },
  ] = useCustomMutation(deleteRepaymentMutation);

  const handleClickSubmit = async () => {
    const response = await deletePayment({
      variables: {
        payment_id: paymentId,
      },
    });
    if (response.status !== "OK") {
      snackbar.showError(`Message: ${response.msg}`);
    } else {
      snackbar.showSuccess("Payment deleted.");
      handleClose();
    }
  };

  const isDialogReady = !isExistingPaymentLoading;
  const isFormLoading = isDeleteRepaymentLoading;
  const isSubmitDisabled = !isDialogReady || isFormLoading;

  return isDialogReady ? (
    <Modal
      isPrimaryActionDisabled={isSubmitDisabled}
      title={"Delete Payment"}
      primaryActionText={"Confirm"}
      handleClose={handleClose}
      handlePrimaryAction={handleClickSubmit}
    >
      <>
        {isBankUser && (
          <Box mt={2} mb={6}>
            <Alert severity="warning">
              <Typography variant="body1">
                {`Warning: you are deleting a payment on behalf of this
                customer (only bank admins can do this).`}
              </Typography>
            </Alert>
          </Box>
        )}
        <Box mb={2}>
          <Typography variant={"h6"}>
            Are you sure you want to delete the following payment? You cannot
            undo this action.
          </Typography>
        </Box>
        {payment && (
          <>
            <Box display="flex" flexDirection="column" mt={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Customer Name
              </Typography>
              <Typography variant={"body1"}>{payment.company.name}</Typography>
            </Box>
            <Box display="flex" flexDirection="column" mt={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Method
              </Typography>
              <Typography variant={"body1"}>
                {payment.method
                  ? PaymentMethodToLabel[payment.method as PaymentMethodEnum]
                  : "Unknown"}
              </Typography>
            </Box>
            <Box display="flex" flexDirection="column" mt={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Requested Amount
              </Typography>
              <Typography variant={"body1"}>
                {formatCurrency(payment.requested_amount)}
              </Typography>
            </Box>
            <Box display="flex" flexDirection="column" mt={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Requested Deposit Date
              </Typography>
              <Typography variant={"body1"}>
                {payment.requested_payment_date
                  ? formatDateString(payment.requested_payment_date)
                  : "-"}
              </Typography>
            </Box>
          </>
        )}
      </>
    </Modal>
  ) : null;
}

export default DeletePaymentModal;
