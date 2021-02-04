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
import { Alert } from "@material-ui/lab";
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
import { AllPaymentMethods, PaymentMethodEnum } from "lib/enum";
import { useCallback, useState } from "react";

interface Props {
  companyId: Companies["id"];
  type: PaymentTransferType;
  errMsg: string;
  handleClose: () => void;
  initialAmount?: number;
  allowablePaymentTypes?: Array<PaymentMethodEnum>;
  onCreate?: (payment: PaymentsInsertInput) => void;
  onCalculateEffectOfPayment?: (payment: PaymentsInsertInput) => void;
  effectComponent: () => React.ReactNode;
}

function PaymentModal(props: Props) {
  const [payment, setPayment] = useState<PaymentsInsertInput>({
    company_id: props.companyId,
    type: props.type,
    amount: props.initialAmount,
    method: PaymentMethodEnum.None,
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

  const isScheduleButtonEnabled =
    payment.method === PaymentMethodEnum.ReverseDraftACH &&
    payment.amount > 0 &&
    payment.deposit_date;

  const isEffectOfPaymentButtonEnabled =
    payment.deposit_date !== null || payment.deposit_date !== undefined;

  return (
    <Dialog open onClose={props.handleClose} fullWidth>
      <DialogTitle>
        Create a Payment
        <span style={{ float: "right" }}>
          <Button
            disabled={!isEffectOfPaymentButtonEnabled}
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
                setPayment({ ...payment, amount: value });
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
                  return { ...payment, method: value as PaymentMethodEnum };
                });
              }}
              style={{ width: 200 }}
            >
              {(props.allowablePaymentTypes || AllPaymentMethods).map(
                (paymentType) => {
                  return <MenuItem value={paymentType}>{paymentType}</MenuItem>;
                }
              )}
            </Select>
          </Box>
          <Box mt={3}>
            {[PaymentMethodEnum.ACH, PaymentMethodEnum.Wire].includes(
              payment.method as PaymentMethodEnum
            ) && (
              <>
                <BankToBankTransfer
                  type={props.type}
                  companyId={props.companyId}
                  onBespokeBankAccountSelection={onBespokeBankAccountSelection}
                  onCompanyBankAccountSelection={onCompanyBankAccountSelection}
                ></BankToBankTransfer>
                <Box mt={2}>
                  <Alert severity="warning">Action is required</Alert>You must
                  initiate this transfer from your bank account. Upon receipt
                  Bespoke will mark this payment as "settled," and apply towards
                  outstanding loans and fees accordingly.
                </Box>
              </>
            )}
            {PaymentMethodEnum.ReverseDraftACH === payment.method && (
              <>
                <CompanyBank
                  companyId={props.companyId}
                  onCompanyBankAccountSelection={(id: BankAccounts["id"]) =>
                    setPayment({ ...payment, company_bank_account_id: id })
                  }
                ></CompanyBank>
                <Box mt={2}>
                  <Alert severity="info">
                    Click "Schedule" for Bespoke to initiate this transfer from
                    your bank account.
                    <br />
                    <br />
                    Upon receipt Bespoke will mark this payment as "settled,"
                    and apply towards outstanding loans and fees accordingly.{" "}
                  </Alert>{" "}
                </Box>
              </>
            )}
            {PaymentMethodEnum.Cash === payment.method && (
              <Box mt={2}>
                <Alert severity="info">
                  A member of the Bespoke team will be in touch via email.
                </Alert>{" "}
                We will coordinate the dispatch of an armored vehicle with your
                team to pick up the amount specified, in cash. This method of
                payment will incur a $100 fee.
              </Box>
            )}
            {PaymentMethodEnum.Check === payment.method && (
              <Box mt={2}>
                <Alert severity="info">
                  Please make the check payable to Bespoke Financial.
                </Alert>
              </Box>
            )}
          </Box>
        </Box>
        {props.effectComponent && props.effectComponent()}
      </DialogContent>
      <DialogActions>
        <Box display="flex">
          {props.errMsg && (
            <span style={{ float: "left" }}>{props.errMsg}</span>
          )}
          <Box pr={1}>
            <Button onClick={props.handleClose}>Cancel</Button>
            <Button
              disabled={!isScheduleButtonEnabled}
              onClick={() => {
                props.onCreate && props.onCreate(payment);
              }}
              variant="contained"
              color="primary"
            >
              Schedule
            </Button>
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default PaymentModal;
