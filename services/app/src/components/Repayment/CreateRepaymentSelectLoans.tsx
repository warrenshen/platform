import {
  Box,
  FormControl,
  FormLabel,
  MenuItem,
  Select,
  Typography,
} from "@material-ui/core";
import CurrencyTextField from "@unicef/material-ui-currency-textfield";
import LoansDataGrid from "components/Loans/LoansDataGrid";
import DatePicker from "components/Shared/Dates/DatePicker";
import { LoanFragment, PaymentsInsertInput } from "generated/graphql";
import {
  AllPaymentMethods,
  AllPaymentOptions,
  PaymentMethodEnum,
  PaymentMethodToLabel,
  PaymentOptionToLabel,
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
  return (
    <Box>
      <Box>
        <Typography>
          Step 1 of 2: Select loans to pay off and specify deposit date, payment
          method, and payment option.
        </Typography>
      </Box>
      <LoansDataGrid
        isSortingDisabled
        isStatusVisible={false}
        loans={selectedLoans}
        customerSearchQuery={""}
      />
      <Box mt={3}>
        <Typography variant="subtitle2">
          What date will the payment leave your bank account?
        </Typography>
        <Box mt={1}>
          <DatePicker
            className=""
            id="payment-modal-payment-date-date-picker"
            label="Payment Date"
            disablePast
            disableNonBankDays
            value={payment.payment_date}
            onChange={(value) => {
              setPayment({
                ...payment,
                payment_date: value,
              });
            }}
          />
        </Box>
      </Box>
      <Box mt={3}>
        <Typography variant="subtitle2">
          Which payment method do you plan to pay with?
        </Typography>
        <Box mt={1}>
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
      </Box>
      <Box mt={3}>
        <Typography variant="subtitle2">
          How much would you like to pay?
        </Typography>
        <Box mt={1}>
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
            {AllPaymentOptions.map((paymentOption) => {
              return (
                <MenuItem key={paymentOption} value={paymentOption}>
                  {PaymentOptionToLabel[paymentOption]}
                </MenuItem>
              );
            })}
          </Select>
        </Box>
      </Box>
      {paymentOption === "custom_amount" && (
        <Box mt={2}>
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
        </Box>
      )}
    </Box>
  );
}

export default CreateRepaymentSelectLoans;
