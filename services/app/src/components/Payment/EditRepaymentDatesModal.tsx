import { Box, Typography } from "@material-ui/core";
import Modal from "components/Shared/Modal/Modal";
import { PurchaseOrders, useGetPaymentQuery } from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import DateInput from "components/Shared/FormInputs/DateInput";
import { useState } from "react";
import { editRepaymentMutation } from "lib/finance/payments/repayment";

interface Props {
  paymentId: PurchaseOrders["id"] | null;
  handleClose: () => void;
}

export default function EditRepaymentDatesModal({
  paymentId,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();
  const [errMsg, setErrMsg] = useState("");
  const [
    updatedRequestedPaymentDate,
    setUpdatedRequestedPaymentDate,
  ] = useState("");
  const [updatedPaymentDate, setUpdatedPaymentDate] = useState("");
  const [updatedDepositDate, setUpdatedDepositDate] = useState("");
  const [updatedSettlementDate, setUpdatedSettlementDate] = useState("");

  const { data, loading: isExistingPaymentLoading } = useGetPaymentQuery({
    fetchPolicy: "network-only",
    variables: {
      id: paymentId,
    },
    onCompleted: (data) => {
      const payment = data?.payments_by_pk || null;

      if (payment) {
        setUpdatedRequestedPaymentDate(payment["requested_payment_date"]);
        setUpdatedPaymentDate(payment["payment_date"]);
        setUpdatedDepositDate(payment["deposit_date"]);
        setUpdatedSettlementDate(payment["settlement_date"]);
      }
    },
  });

  const [
    editRepayment,
    { loading: isEditRepaymentLoading },
  ] = useCustomMutation(editRepaymentMutation);

  const payment = data?.payments_by_pk || null;

  const handleClickSubmit = async () => {
    if (!payment) {
      console.error("Developer error: payment is missing.");
      return;
    }

    const response = await editRepayment({
      variables: {
        company_id: payment.company_id,
        payment: {
          id: payment.id,
          company_id: payment.company_id,
          type: payment.type,
          requested_amount: payment.requested_amount,
          method: payment.method,
          requested_payment_date: updatedRequestedPaymentDate,
          payment_date: updatedPaymentDate,
          deposit_date: updatedDepositDate,
          settlement_date: updatedSettlementDate,
        },
      },
    });

    if (response.status !== "OK") {
      setErrMsg(response.msg);
    } else {
      setErrMsg("");
      snackbar.showSuccess("Repayment date edits submitted successfully.");
      handleClose();
    }
  };

  const isDialogReady = !isExistingPaymentLoading && !isEditRepaymentLoading;
  const isSubmitDisabled = !isDialogReady;

  if (!isDialogReady) {
    return null;
  }

  return (
    <Modal
      isPrimaryActionDisabled={isSubmitDisabled}
      title={"Edit Repayment Dates"}
      primaryActionText={"Confirm"}
      handleClose={handleClose}
      handlePrimaryAction={handleClickSubmit}
    >
      <Box mb={2}>
        <Typography variant={"h6"}>
          You may edit the associated dates with this repayment below..
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
              Repayment ID
            </Typography>
            <Typography
              variant={"body1"}
            >{`R${payment.settlement_identifier}`}</Typography>
          </Box>
          <Box display="flex" flexDirection="column" mt={4}>
            <DateInput
              disableNonBankDays
              id="requested-repayment-date-picker"
              label="Requested Repayment Date"
              value={updatedRequestedPaymentDate}
              onChange={(value) => {
                setUpdatedRequestedPaymentDate(value ? value : "");
              }}
            />
            <Box mt={1}>
              <Typography variant="body2" color="textSecondary">
                Setting this field will update the requested repayment date.
              </Typography>
            </Box>
          </Box>
          <Box display="flex" flexDirection="column" mt={4}>
            <DateInput
              disableNonBankDays
              id="repayment-date-picker"
              label="Repayment Date"
              value={updatedPaymentDate}
              onChange={(value) => {
                setUpdatedPaymentDate(value ? value : "");
              }}
            />
            <Box mt={1}>
              <Typography variant="body2" color="textSecondary">
                Setting this field will update the repayment date.
              </Typography>
            </Box>
          </Box>
          <Box display="flex" flexDirection="column" mt={4}>
            <DateInput
              disableNonBankDays
              className={"requested-payment-date"}
              id="deposit-date-picker"
              label="Deposit Date"
              value={updatedDepositDate}
              onChange={(value) => {
                setUpdatedDepositDate(value ? value : "");
              }}
            />
            <Box mt={1}>
              <Typography variant="body2" color="textSecondary">
                Setting this field will update the deposit date.
              </Typography>
            </Box>
          </Box>
          <Box display="flex" flexDirection="column" mt={4}>
            <DateInput
              disableNonBankDays
              id="settlement-date-picker"
              label="Settlement Date"
              value={updatedSettlementDate}
              onChange={(value) => {
                setUpdatedSettlementDate(value ? value : "");
              }}
            />
            <Box mt={1}>
              <Typography variant="body2" color="textSecondary">
                Setting this field will update the settlement date.
              </Typography>
            </Box>
          </Box>
          {errMsg && (
            <Box display="flex" width="100%" mt={2}>
              <Typography variant="body1" color="secondary">
                {errMsg}
              </Typography>
            </Box>
          )}
        </>
      )}
    </Modal>
  );
}
