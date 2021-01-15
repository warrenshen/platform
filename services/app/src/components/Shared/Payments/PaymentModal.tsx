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
import {
  BankAccounts,
  Companies,
  PaymentsInsertInput,
} from "generated/graphql";
import { useCallback, useState } from "react";

export enum PaymentMethod {
  ACH = "ach",
  ReverseDraftACH = "reverse_draft_ach",
  Wire = "wire",
  Check = "check",
  Cash = "cash",
  None = "none",
}
interface Props {
  companyId: Companies["id"];
  direction: PaymentTransferDirection;
  handleClose: () => void;
  initialAmount?: number;
  allowablePaymentTypes?: Array<PaymentMethod>;
  onCreate?: (payment: PaymentsInsertInput) => void;
  coverageComponent?: (amount: number) => React.ReactNode;
}

function PaymentModal(props: Props) {
  const [payment, setPayment] = useState<PaymentsInsertInput>({
    company_id: props.companyId,
    direction: props.direction,
    amount: props.initialAmount,
    method: PaymentMethod.None,
  });

  const onBespokeBankAccountSelection = useCallback(
    (id: BankAccounts["id"]) => {
      setPayment((payment) => {
        return { ...payment, bespoke_bank_account_id: id };
      });
    },
    []
  );

  const onCompanyBankAccountSelection = useCallback(
    (id: BankAccounts["id"]) => {
      setPayment((payment) => {
        return { ...payment, company_bank_account_id: id };
      });
    },
    []
  );

  return (
    <Dialog open onClose={props.handleClose} fullWidth>
      <DialogTitle>Make a Payment</DialogTitle>
      <DialogContent style={{ height: 500 }}>
        <Box display="flex" flexDirection="column">
          <FormControl style={{ width: 200 }}>
            <InputLabel htmlFor="standard-adornment-amount">Amount</InputLabel>
            <Input
              id="standard-adornment-amount"
              value={payment.amount}
              type="number"
              onChange={({ target: { value } }) => {
                setPayment((payment) => {
                  return { ...payment, amount: Number(value) };
                });
              }}
              startAdornment={
                <InputAdornment position="start">$</InputAdornment>
              }
            />
          </FormControl>
          <Box mt={3}>
            <Select
              value={payment.method}
              onChange={({ target: { value } }) => {
                setPayment((payment) => {
                  return { ...payment, method: value as PaymentMethod };
                });
              }}
              style={{ width: 200 }}
            >
              {(
                props.allowablePaymentTypes || [
                  PaymentMethod.None,
                  PaymentMethod.ACH,
                  PaymentMethod.ReverseDraftACH,
                  PaymentMethod.Wire,
                  PaymentMethod.Cash,
                  PaymentMethod.Check,
                ]
              ).map((paymentType) => {
                return <MenuItem value={paymentType}>{paymentType}</MenuItem>;
              })}
            </Select>
          </Box>
          <Box mt={3}>
            {[PaymentMethod.ACH, PaymentMethod.Wire].includes(
              payment.method as PaymentMethod
            ) && (
              <>
                <BankToBankTransfer
                  direction={props.direction}
                  companyId={props.companyId}
                  onBespokeBankAccountSelection={onBespokeBankAccountSelection}
                  onCompanyBankAccountSelection={onCompanyBankAccountSelection}
                ></BankToBankTransfer>
                <Box mt={2}>
                  Action is required: You must initiate this transfer from your
                  bank account. Upon receipt Bespoke will mark this payment as
                  "settled," and apply towards outstanding loans and fees
                  accordingly.
                </Box>
              </>
            )}
            {PaymentMethod.ReverseDraftACH ===
              (payment.method as PaymentMethod) && (
              <>
                <CompanyBank
                  companyId={props.companyId}
                  onCompanyBankAccountSelection={(id: BankAccounts["id"]) =>
                    setPayment({ ...payment, company_bank_account_id: id })
                  }
                ></CompanyBank>
                <Box mt={2}>
                  No further action is required: Bespoke will initiate this
                  transfer to pull funds from your bank account. Upon receipt
                  Bespoke will mark this payment as "settled," and apply towards
                  outstanding loans and fees accordingly.
                </Box>
              </>
            )}
            {PaymentMethod.Cash === payment.method && (
              <Box mt={2}>
                A member of the Bespoke team will be in touch via email. We will
                coordinate the dispatch of an armored vehicle with your team to
                pick up the amount specified, in cash. This method of payment
                will incur a $100 fee.
              </Box>
            )}
            {PaymentMethod.Check === payment.method && (
              <Box mt={2}>
                Please make the check payable to Bespoke Financial.
              </Box>
            )}
          </Box>
        </Box>
        {props.coverageComponent && props.coverageComponent(payment.amount)}
      </DialogContent>
      <DialogActions>
        <Box display="flex">
          <Box pr={1}>
            <Button onClick={props.handleClose}>Cancel</Button>
            <Button
              onClick={() => {
                props.onCreate && props.onCreate(payment);
              }}
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
