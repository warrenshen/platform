import {
  Box,
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  Theme,
} from "@material-ui/core";
import CurrencyInput from "components/Shared/FormInputs/CurrencyInput";
import DatePicker from "components/Shared/FormInputs/DatePicker";
import {
  InvoiceFragment,
  PaymentsInsertInput,
  RequestStatusEnum,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { respondToInvoicePaymentMutation } from "lib/api/invoices";
import { todayAsDateStringServer } from "lib/date";
import { PaymentMethodToLabel, PayorPaymentMethods } from "lib/enum";
import { useState } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialog: {
      width: 400,
    },
    dialogTitle: {
      borderBottom: "1px solid #c7c7c7",
    },
    dialogActions: {
      margin: theme.spacing(2),
    },
    submitButton: {
      marginLeft: theme.spacing(1),
    },
    inputField: {
      width: 300,
    },
  })
);

interface Props {
  invoice: InvoiceFragment;
  linkVal: string; // the link value used to generate this one-time reject ability
  handleClose: () => void;
  handleConfirmSuccess: () => void;
}

export default function ReviewInvoicePaymentConfirmModal({
  invoice,
  linkVal,
  handleClose,
  handleConfirmSuccess,
}: Props) {
  const snackbar = useSnackbar();
  const classes = useStyles();

  const [state, setState] = useState<PaymentsInsertInput>({
    requested_payment_date: todayAsDateStringServer(),
    amount: invoice.total_amount,
    method: "",
  });

  const [respondToInvoicePayment, { loading }] = useCustomMutation(
    respondToInvoicePaymentMutation
  );

  const handleClickApprove = async () => {
    const response = await respondToInvoicePayment({
      variables: {
        invoice_id: invoice.id,
        new_status: RequestStatusEnum.Approved,
        rejection_note: null,
        amount: state.amount,
        anticipated_payment_date: state.requested_payment_date,
        payment_method: state.method,
        link_val: linkVal,
      },
    });
    if (response.status === "ERROR") {
      snackbar.showError(
        `Error! Something went wrong. Reason: ${response.msg}`
      );
    } else {
      snackbar.showSuccess("Success! Payment intent submitted.");
      handleConfirmSuccess();
    }
  };

  const isSubmitDisabled =
    !state.amount || !state.requested_payment_date || !state.method || loading;

  return (
    <Dialog
      open
      onClose={handleClose}
      maxWidth="lg"
      classes={{ paper: classes.dialog }}
    >
      <DialogTitle className={classes.dialogTitle}>
        Confirm Your Payment
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please affirm your intent to pay this invoice. We'd like to know the
          date you expect to make your payment and by what means. If you intend
          to pay less than the subtotal amount, please inform us of that as
          well.
        </DialogContentText>
        <Box display="flex" flexDirection="column" mt={2}>
          <DatePicker
            className={classes.inputField}
            id="payment-date-date-picker"
            label="Payment Date"
            disablePast
            disableNonBankDays
            value={state.requested_payment_date}
            onChange={(value) =>
              setState({
                ...state,
                requested_payment_date: value,
              })
            }
          />
        </Box>
        <Box mt={3}>
          <FormControl className={classes.inputField}>
            <InputLabel id="select-payment-method-label">
              Payment Method
            </InputLabel>
            <Select
              id="select-payment-method"
              labelId="select-payment-method-label"
              value={state.method}
              onChange={({ target: { value } }) =>
                setState({
                  ...state,
                  method: value as string,
                })
              }
            >
              {PayorPaymentMethods.map((method) => {
                return (
                  <MenuItem key={method} value={method}>
                    {PaymentMethodToLabel[method]}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Box>
        <Box mt={3}>
          <FormControl className={classes.inputField}>
            <CurrencyInput
              label={"Amount"}
              value={state.amount}
              handleChange={(value: number) =>
                setState({
                  ...state,
                  amount: value,
                })
              }
            />
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Button variant={"contained"} color={"default"} onClick={handleClose}>
          Cancel
        </Button>
        <Button
          disabled={isSubmitDisabled}
          variant={"contained"}
          color={"primary"}
          onClick={handleClickApprove}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}
