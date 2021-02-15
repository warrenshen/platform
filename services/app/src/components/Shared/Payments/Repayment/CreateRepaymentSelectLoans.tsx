import {
  Box,
  FormControl,
  FormLabel,
  MenuItem,
  Select,
} from "@material-ui/core";
import CurrencyTextField from "@unicef/material-ui-currency-textfield";
import LoansDataGrid from "components/Loans/LoansDataGrid";
import DatePicker from "components/Shared/Dates/DatePicker";
import { LoanFragment, PaymentsInsertInput } from "generated/graphql";
import {
  AllPaymentMethods,
  PaymentMethodEnum,
  PaymentMethodToLabel,
} from "lib/enum";

interface Props {
  selectedLoans: LoanFragment[];
  payment: PaymentsInsertInput;
  paymentOption: string;
  setPayment: (payment: PaymentsInsertInput) => void;
  setPaymentOption: (paymentOption: string) => void;
}

function CreateRepaymentSelectLoans({
  selectedLoans,
  payment,
  paymentOption,
  setPayment,
  setPaymentOption,
}: Props) {
  const paymentOptions = [
    { value: "pay_in_full", displayValue: "Pay in full" },
    { value: "pay_minimum_due", displayValue: "Pay minimum due" },
    { value: "custom_amount", displayValue: "Custom amount" },
  ];

  return (
    <Box>
      <LoansDataGrid
        isStatusVisible={false}
        loans={selectedLoans}
        customerSearchQuery={""}
      />
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
        <FormLabel component="legend" style={{ fontSize: "12px" }} required>
          Payment Method
        </FormLabel>
        <Select
          value={payment.method}
          onChange={({ target: { value } }) =>
            setPayment({
              ...payment,
              method: value as PaymentMethodEnum,
            })
          }
          style={{ width: 200 }}
        >
          {AllPaymentMethods.map((paymentType) => {
            return (
              <MenuItem key={paymentType} value={paymentType}>
                {PaymentMethodToLabel[paymentType]}
              </MenuItem>
            );
          })}
        </Select>
      </Box>
      <Box mt={3}>
        <FormLabel component="legend" style={{ fontSize: "12px" }} required>
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
              <MenuItem key={paymentOption.value} value={paymentOption.value}>
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
            />
          </FormControl>
        )}
      </Box>
    </Box>
  );
}

export default CreateRepaymentSelectLoans;
