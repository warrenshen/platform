import { Box, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import DateInput from "components/Shared/FormInputs/DateInput";
import Modal from "components/Shared/Modal/Modal";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { Transactions, useGetPaymentQuery } from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { editAccountLevelFeeMutation } from "lib/api/payments";
import { formatDateString } from "lib/date";
import { PlatformModeEnum } from "lib/enum";
import { formatCurrency } from "lib/number";
import { useContext, useEffect, useState } from "react";

interface Props {
  paymentId: Transactions["id"] | null;
  handleClose: () => void;
}

function EditAccountFeeModal({ paymentId, handleClose }: Props) {
  const snackbar = useSnackbar();

  const {
    user: { platformMode },
  } = useContext(CurrentUserContext);
  const isBankUser = platformMode === PlatformModeEnum.Bank;

  const { data, loading: isExistingPaymentLoading } = useGetPaymentQuery({
    fetchPolicy: "network-only",
    variables: {
      id: paymentId,
    },
  });

  const payment = data?.payments_by_pk || null;

  const [selectedDate, setSelectedDate] = useState(
    payment?.settlement_date || null
  );

  useEffect(() => setSelectedDate(payment?.settlement_date), [payment]);

  const [editAccountLevelFee, { loading: isEditAccountLevelFeeLoading }] =
    useCustomMutation(editAccountLevelFeeMutation);

  const handleClickSubmit = async () => {
    const response = await editAccountLevelFee({
      variables: {
        payment_id: paymentId,
        effective_date: selectedDate,
      },
    });
    if (response.status !== "OK") {
      snackbar.showError(`Message: ${response.msg}`);
    } else {
      snackbar.showSuccess(`Account fee edited.`);
      handleClose();
    }
  };

  const isDialogReady = !isExistingPaymentLoading;
  const isFormLoading = isEditAccountLevelFeeLoading;
  const isSubmitDisabled = !isDialogReady || isFormLoading;

  return isDialogReady ? (
    <Modal
      isPrimaryActionDisabled={isSubmitDisabled}
      title={"Edit Account Fee"}
      primaryActionText={"Confirm"}
      handleClose={handleClose}
      handlePrimaryAction={handleClickSubmit}
    >
      <>
        {isBankUser && (
          <Box mt={2} mb={6}>
            <Alert severity="warning">
              <Typography variant="body1">
                {`Warning: you are editing an account fee on behalf of this
                customer (only bank admins can do this).`}
              </Typography>
            </Alert>
          </Box>
        )}
        {!!payment && (
          <>
            <Box display="flex" flexDirection="column" mt={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Customer Name
              </Typography>
              <Typography variant={"body1"}>{payment.company.name}</Typography>
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
                {!!payment.requested_payment_date
                  ? formatDateString(payment.requested_payment_date)
                  : "-"}
              </Typography>
            </Box>
            <Box display="flex" flexDirection="column" mt={2}>
              <DateInput
                dataCy={"effective-date"}
                id="effective-date-date-picker"
                label="Effective Date"
                value={selectedDate}
                onChange={(value) => {
                  setSelectedDate(value);
                }}
              />
            </Box>
          </>
        )}
      </>
    </Modal>
  ) : null;
}

export default EditAccountFeeModal;
