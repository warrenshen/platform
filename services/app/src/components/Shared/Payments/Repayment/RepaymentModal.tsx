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
import {
  AllPaymentMethods,
  PaymentMethodEnum,
  PaymentMethodToLabel,
} from "lib/enum";
import {
  calculateEffectOfPayment,
  createPayment,
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
  /*const [
    effectResp,
    setEffectResp,
  ] = useState<CalculateEffectOfPaymentResp | null>(null);*/
  // A payment option is the user's choice to payment the remaining balances on the loan, to
  // pay the minimum amount required, or to pay a custom amount.
  const [paymentOption, setPaymentOption] = useState("");

  // There are 2 states that we show, one when the user is selecting the payment method
  // date, and payment type, and the next is when they have to "confirm" what they
  // have selected.
  const [onConfirmationSection, setOnConfirmationSection] = useState(false);

  const isDepositDateSet =
    payment.deposit_date !== null || payment.deposit_date !== undefined;

  const isPaymentMethodSet =
    payment.method && payment.method !== PaymentMethodEnum.None;

  const isActionButtonEnabled =
    isPaymentMethodSet && payment.amount > 0 && isDepositDateSet;
  const actionBtnText =
    payment.method === PaymentMethodEnum.ReverseDraftACH
      ? "Schedule"
      : "Notify";
  const isNextButtonEnabled =
    isDepositDateSet && isPaymentMethodSet && paymentOption !== "";
  const paymentOptions = [
    { value: "pay_in_full", displayValue: "Pay in full" },
    { value: "pay_minimum_due", displayValue: "Pay minimum due" },
    { value: "custom_amount", displayValue: "Custom amount" },
  ];
  const selectedLoanIds = selectedLoans.map((l) => {
    return l.id;
  });

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
          ></LoansDataGrid>
          {!onConfirmationSection && (
            <>
              <Box>
                <DatePicker
                  className=""
                  id="payment-modal-deposit-date-date-picker"
                  label="Desposit Date"
                  disablePast
                  disableNonBankDays
                  value={payment.deposit_date}
                  onChange={(value) => {
                    setPayment({
                      ...payment,
                      deposit_date: value,
                    });
                  }}
                />
              </Box>
              <Box mt={3}>
                <FormLabel
                  component="legend"
                  style={{ fontSize: "12px" }}
                  required
                >
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
                      <MenuItem value={paymentType}>
                        {PaymentMethodToLabel[paymentType]}
                      </MenuItem>
                    );
                  })}
                </Select>
              </Box>
              <Box mt={3}>
                <FormLabel
                  component="legend"
                  style={{ fontSize: "12px" }}
                  required
                >
                  Payment Option
                </FormLabel>
                <Select
                  value={paymentOption}
                  onChange={({ target: { value } }) => {
                    setPaymentOption(value as string);
                  }}
                  style={{ width: 200 }}
                >
                  {paymentOptions.map((paymentOption) => {
                    return (
                      <MenuItem value={paymentOption.value}>
                        {paymentOption.displayValue}
                      </MenuItem>
                    );
                  })}
                </Select>
              </Box>
              <Box mt={2}>
                {paymentOption === "custom_amount" && (
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
                )}
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
                    payment_option: paymentOption,
                    loan_ids: selectedLoanIds,
                  });
                  if (resp.status !== "OK") {
                    setErrMsg(resp.msg || "");
                  } else {
                    setErrMsg("");
                    setPayment({ ...payment, amount: resp.amount_to_pay || 0 });
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
                disabled={!isActionButtonEnabled}
                onClick={async () => {
                  if (payment.amount !== null && payment.amount !== undefined) {
                    payment.amount = parseFloat(payment.amount);
                  } else {
                    setErrMsg("Payment amount must be larger than 0");
                    return;
                  }
                  const resp = await createPayment({
                    payment: payment,
                    company_id: companyId,
                    loan_ids: selectedLoanIds,
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
                {actionBtnText}
              </Button>
            )}
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default RepaymentModal;
