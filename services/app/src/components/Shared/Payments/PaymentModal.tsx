import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Input,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
} from "@material-ui/core";
import BankToBankTransfer, {
  PaymentTransferDirection,
} from "components/Shared/BankToBankTransfer";
import CompanyBank from "components/Shared/BankToBankTransfer/CompanyBank";
import { Companies } from "generated/graphql";
import { useState } from "react";

interface Props {
  companyId: Companies["id"];
  direction: PaymentTransferDirection;
  handleClose: () => void;
}

enum PaymentType {
  ACH = "ach",
  ReverseDraftACH = "reverse_draft_ach",
  Wire = "wire",
  Check = "check",
  Cash = "cash",
  None = "none",
}

function PaymentModal(props: Props) {
  const [amount, setAmount] = useState<number | undefined>();
  const [paymentType, setPaymentType] = useState<PaymentType>(PaymentType.None);

  return (
    <Dialog open onClose={props.handleClose} fullWidth>
      <DialogTitle>Make a Payment</DialogTitle>
      <DialogContent style={{ height: 500 }}>
        <Box display="flex" flexDirection="column">
          <FormControl style={{ width: 200 }}>
            <InputLabel htmlFor="standard-adornment-amount">Amount</InputLabel>
            <Input
              id="standard-adornment-amount"
              value={amount}
              type="number"
              onChange={({ target: { value } }) => {
                setAmount(Number(value));
              }}
              startAdornment={
                <InputAdornment position="start">$</InputAdornment>
              }
            />
          </FormControl>
          <Box mt={3}>
            <Select
              value={String(paymentType)}
              onChange={({ target: { value } }) => {
                setPaymentType(value as PaymentType);
              }}
              style={{ width: 200 }}
            >
              {[
                PaymentType.None,
                PaymentType.ACH,
                PaymentType.ReverseDraftACH,
                PaymentType.Wire,
                PaymentType.Cash,
                PaymentType.Check,
              ].map((paymentType) => {
                return <MenuItem value={paymentType}>{paymentType}</MenuItem>;
              })}
            </Select>
          </Box>
          <Box mt={3}>
            {[PaymentType.ACH, PaymentType.Wire].includes(paymentType) && (
              <>
                <BankToBankTransfer
                  direction={props.direction}
                  companyId={props.companyId}
                ></BankToBankTransfer>
                <Box mt={2}>
                  Action is required: You must initiate this transfer from your
                  bank account. Upon receipt Bespoke will mark this payment as
                  "settled," and apply towards outstanding loans and fees
                  accordingly.
                </Box>
              </>
            )}
            {PaymentType.ReverseDraftACH === paymentType && (
              <>
                <CompanyBank companyId={props.companyId}></CompanyBank>
                <Box mt={2}>
                  No further action is required: Bespoke will initiate this
                  transfer to pull funds from your bank account. Upon receipt
                  Bespoke will mark this payment as "settled," and apply towards
                  outstanding loans and fees accordingly.
                </Box>
              </>
            )}
            {PaymentType.Cash === paymentType && (
              <>
                A member of the Bespoke team will be in touch via email. We will
                coordinate the dispatch of an armored vehicle with your team to
                pick up the amount specified, in cash. This method of payment
                will incur a $100 fee.
              </>
            )}
            {PaymentType.Check === paymentType && (
              <>Please make the check payable to Bespoke Financial.</>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Box display="flex">
          <Box pr={1}>
            <Button onClick={props.handleClose}>Cancel</Button>
            <Button
              onClick={props.handleClose}
              variant="contained"
              color="primary"
            >
              Save
            </Button>
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default PaymentModal;
