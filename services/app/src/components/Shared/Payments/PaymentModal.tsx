import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  MenuItem,
  Select,
} from "@material-ui/core";
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";
import CurrencyTextField from "@unicef/material-ui-currency-textfield";
import BankToBankTransfer, {
  PaymentTransferType,
} from "components/Shared/BankToBankTransfer";
import CompanyBank from "components/Shared/BankToBankTransfer/CompanyBank";
import DatePicker from "components/Shared/Dates/DatePicker";
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
  type: PaymentTransferType;
  handleClose: () => void;
  initialAmount?: number;
  allowablePaymentTypes?: Array<PaymentMethod>;
  onCreate?: (payment: PaymentsInsertInput) => void;
  onCalculateEffectOfPayment?: (payment: PaymentsInsertInput) => void;
  coverageComponent?: (amount: number) => React.ReactNode;
}

function PaymentModal(props: Props) {
  const [payment, setPayment] = useState<PaymentsInsertInput>({
    company_id: props.companyId,
    type: props.type,
    amount: props.initialAmount,
    method: PaymentMethod.None,
    deposit_date: null,
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
      <DialogTitle>
        Create a Payment
        <span style={{ float: "right" }}>
          <Button
            onClick={() => {
              props.onCalculateEffectOfPayment &&
                props.onCalculateEffectOfPayment(payment);
            }}
            variant="contained"
            color="default"
          >
            Calculate Effect
          </Button>
        </span>
      </DialogTitle>
      <DialogContent style={{ height: 500 }}>
        <Box display="flex" flexDirection="column">
          <FormControl style={{ width: 200 }}>
            <CurrencyTextField
              label="Amount"
              currencySymbol="$"
              outputFormat="string"
              textAlign="left"
              value={payment.amount}
              onChange={(_event: any, value: string) => {
                debugger;
                setPayment({ ...payment, amount: parseFloat(value) });
              }}
            ></CurrencyTextField>
          </FormControl>
          <Box>
            <DatePicker
              className=""
              id="payment-modal-deposit-date-date-picker"
              label="Desposit Date"
              disablePast={true}
              disableNonBankDays={true}
              value={payment.deposit_date}
              onChange={(value: MaterialUiPickersDate) => {
                setPayment({
                  ...payment,
                  deposit_date: value ? value : new Date().getUTCDate(),
                });
              }}
            />
          </Box>
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
                  type={props.type}
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
            {PaymentMethod.ReverseDraftACH === payment.method && (
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
              Create
            </Button>
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default PaymentModal;
