import { Box, Typography } from "@material-ui/core";
import Modal from "components/Shared/Modal/Modal";
import { PurchaseOrders, useGetPaymentQuery } from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { formatCurrency } from "lib/number";
import { formatDateString } from "lib/date";
import { RepaymentMethodEnum, RepaymentMethodToLabel } from "lib/enum";
import { reverseRepaymentMutation } from "lib/finance/payments/repayment";

interface Props {
  paymentId: PurchaseOrders["id"] | null;
  handleClose: () => void;
}

export default function ReverseRepaymentModal({
  paymentId,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();

  const { data, loading: isExistingPaymentLoading } = useGetPaymentQuery({
    fetchPolicy: "network-only",
    variables: {
      id: paymentId,
    },
  });

  const payment = data?.payments_by_pk || null;

  const [
    reverseRepayment,
    { loading: isReverseRepaymentLoading },
  ] = useCustomMutation(reverseRepaymentMutation);

  const handleClickSubmit = async () => {
    if (!payment) {
      console.error("Developer error: payment is missing.");
      return;
    }

    const response = await reverseRepayment({
      variables: {
        company_id: payment.company_id,
        payment_id: paymentId,
      },
    });
    if (response.status !== "OK") {
      snackbar.showError(`Message: ${response.msg}`);
    } else {
      snackbar.showSuccess("Payment reversed.");
      handleClose();
    }
  };

  const isDialogReady = !isExistingPaymentLoading;
  const isFormLoading = isReverseRepaymentLoading;
  const isSubmitDisabled = !isDialogReady || isFormLoading;

  if (!isDialogReady) {
    return null;
  }

  return (
    <Modal
      isPrimaryActionDisabled={isSubmitDisabled}
      title={"Reverse Payment"}
      primaryActionText={"Confirm"}
      handleClose={handleClose}
      handlePrimaryAction={handleClickSubmit}
    >
      <Box mb={2}>
        <Typography variant={"h6"}>
          Are you sure you want to reverse the following payment? You CANNOT
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
                ? RepaymentMethodToLabel[payment.method as RepaymentMethodEnum]
                : "Unknown"}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Amount
            </Typography>
            <Typography variant={"body1"}>
              {formatCurrency(payment.amount)}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Deposit Date
            </Typography>
            <Typography variant={"body1"}>
              {payment.deposit_date
                ? formatDateString(payment.deposit_date)
                : "-"}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Settlement Date
            </Typography>
            <Typography variant={"body1"}>
              {payment.settlement_date
                ? formatDateString(payment.settlement_date)
                : "-"}
            </Typography>
          </Box>
        </>
      )}
    </Modal>
  );
}
