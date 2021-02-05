import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormLabel,
  MenuItem,
  Select,
} from "@material-ui/core";
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";
import CurrencyTextField from "@unicef/material-ui-currency-textfield";
import { PaymentTransferType } from "components/Shared/BankToBankTransfer";
import DatePicker from "components/Shared/Dates/DatePicker";
import LoansDataGrid from "components/Shared/Loans/LoansDataGrid";
import ConfirmationSection from "components/Shared/Payments/Repayment/ConfirmationSection";
import {
  Companies,
  LoanFragment,
  PaymentsInsertInput,
} from "generated/graphql";
import { AllPaymentMethods, PaymentMethodEnum } from "lib/enum";
import {
  calculateEffectOfPayment,
  CalculateEffectOfPaymentResp,
  makePayment,
} from "lib/finance/payments/repayment";
import { useState } from "react";

interface Props {
  companyId: Companies["id"];
  handleClose: () => void;
  selectedLoans: LoanFragment[];
  setOpen: (val: boolean) => void;
}

function RepaymentModal({
  companyId,
  handleClose,
  selectedLoans,
  setOpen,
}: Props) {
  const [errMsg, setErrMsg] = useState("");
  const [payment, setPayment] = useState<PaymentsInsertInput>({
    company_id: companyId,
    type: PaymentTransferType.ToBank,
    amount: 0.0,
    method: PaymentMethodEnum.None,
    deposit_date: null,
  });
  const [
    effectResp,
    setEffectResp,
  ] = useState<CalculateEffectOfPaymentResp | null>(null);
  // There are 2 states that we show, one when the user is selecting the payment method
  // date, and payment type, and the next is when they have to "confirm" what they
  // have selected.
  const [onConfirmationSection, setOnConfirmationSection] = useState(false);

  const isDepositDateSet =
    payment.deposit_date !== null || payment.deposit_date !== undefined;
  const isScheduleButtonEnabled =
    payment.method === PaymentMethodEnum.ReverseDraftACH &&
    payment.amount > 0 &&
    isDepositDateSet;
  const isPaymentMethodSet = payment.method !== PaymentMethodEnum.None;
  const isNextButtonEnabled = isDepositDateSet && isPaymentMethodSet;

  return (
    <Dialog open onClose={handleClose} fullWidth>
      <DialogTitle>
        Create a Payment
        <span style={{ float: "right" }}>
          <Button
            disabled={!onConfirmationSection}
            onClick={() => {
              setOnConfirmationSection(false);
            }}
            variant="contained"
            color="default"
          >
            Back
          </Button>
        </span>
      </DialogTitle>
      <DialogContent style={{ minHeight: 400 }}>
        <Box display="flex" flexDirection="column">
          <LoansDataGrid
            loans={selectedLoans}
            customerSearchQuery={""}
            onClickCustomerName={() => {}}
          ></LoansDataGrid>
          {!onConfirmationSection && (
            <>
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
                <FormLabel component="legend" style={{ fontSize: "12px" }}>
                  Payment Method
                </FormLabel>
                <Select
                  value={payment.method}
                  onChange={({ target: { value } }) => {
                    setPayment((payment) => {
                      return { ...payment, method: value as PaymentMethodEnum };
                    });
                  }}
                  style={{ width: 200 }}
                >
                  {AllPaymentMethods.map((paymentType) => {
                    return (
                      <MenuItem value={paymentType}>{paymentType}</MenuItem>
                    );
                  })}
                </Select>
              </Box>
            </>
          )}
          <Box mt={3}>
            {onConfirmationSection && (
              <ConfirmationSection
                payment={payment}
                setPayment={setPayment}
              ></ConfirmationSection>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Box display="flex">
          {errMsg && <span style={{ float: "left" }}>{errMsg}</span>}
          <Box pr={1}>
            <Button onClick={handleClose}>Cancel</Button>
            {!onConfirmationSection && (
              <Button
                disabled={!isNextButtonEnabled}
                onClick={async () => {
                  if (payment.amount && payment.amount.length > 0) {
                    payment.amount = parseFloat(payment.amount);
                  }
                  const resp = await calculateEffectOfPayment({
                    payment: payment,
                    company_id: companyId,
                    loan_ids: selectedLoans.map((loan) => {
                      return loan.id;
                    }),
                  });
                  if (resp.status !== "OK") {
                    setErrMsg(resp.msg || "");
                  } else {
                    setErrMsg("");
                    setEffectResp(resp);
                    setOnConfirmationSection(true);
                  }
                }}
                variant="contained"
                color="primary"
              >
                Next
              </Button>
            )}
            {onConfirmationSection && (
              <Button
                disabled={!isScheduleButtonEnabled}
                onClick={async () => {
                  if (payment.amount && payment.amount.length > 0) {
                    payment.amount = parseFloat(payment.amount);
                  } else {
                    setErrMsg("Payment amount must be larger than 0");
                    return;
                  }
                  const resp = await makePayment({
                    payment: payment,
                    company_id: companyId,
                  });
                  if (resp.status !== "OK") {
                    setErrMsg(resp.msg);
                  } else {
                    setErrMsg("");
                    setOpen(false);
                  }
                }}
                variant="contained"
                color="primary"
              >
                Schedule
              </Button>
            )}
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default RepaymentModal;
