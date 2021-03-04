import {
  Box,
  createStyles,
  FormControl,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  Theme,
  Typography,
} from "@material-ui/core";
import CurrencyTextField from "@unicef/material-ui-currency-textfield";
import LoansDataGrid from "components/Loans/LoansDataGrid";
import DatePicker from "components/Shared/Dates/DatePicker";
import { LoanFragment, PaymentsInsertInput } from "generated/graphql";
import { PaymentMethodEnum, PaymentMethodToLabel } from "lib/enum";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    inputField: {
      width: 300,
    },
  })
);

interface Props {
  payment: PaymentsInsertInput;
  selectedLoans: LoanFragment[];
  settlementDate: string | null;
  setPayment: (payment: PaymentsInsertInput) => void;
}

function PaymentAdvanceForm({
  payment,
  selectedLoans,
  settlementDate,
  setPayment,
}: Props) {
  const classes = useStyles();

  return (
    <Box display="flex" flexDirection="column">
      <Box mt={3}>
        <Typography>
          You are recording advances(s) for the following loans. Please enter in
          payment information for the advance sent out and then press "Submit".
        </Typography>
      </Box>
      <Box mt={3}>
        <LoansDataGrid isSortingDisabled loans={selectedLoans} />
      </Box>
      <Box mt={3}>
        <FormControl className={classes.inputField}>
          <InputLabel id="select-payment-method-label" required>
            Payment Method
          </InputLabel>
          <Select
            id="select-payment-method"
            labelId="select-payment-method-label"
            value={payment.method}
            onChange={({ target: { value } }) => {
              setPayment({
                ...payment,
                method: value as PaymentMethodEnum,
              });
            }}
          >
            {[PaymentMethodEnum.ACH, PaymentMethodEnum.Wire].map(
              (paymentMethod) => (
                <MenuItem key={paymentMethod} value={paymentMethod}>
                  {PaymentMethodToLabel[paymentMethod]}
                </MenuItem>
              )
            )}
          </Select>
        </FormControl>
      </Box>
      <Box display="flex" flexDirection="column" mt={3}>
        <DatePicker
          className={classes.inputField}
          id="payment-date-date-picker"
          label="Payment Date"
          disableNonBankDays
          value={payment.payment_date}
          onChange={(value) =>
            setPayment({
              ...payment,
              payment_date: value,
            })
          }
        />
        <Box mt={1}>
          <Typography variant="body2" color="textSecondary">
            Payment Date is the date you sent or will send the advance out.
          </Typography>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" mt={3}>
        <DatePicker
          className={classes.inputField}
          id="settlement-date-date-picker"
          label="Settlement Date"
          disableNonBankDays
          disabled
          value={settlementDate}
        />
        <Box mt={1}>
          <Typography variant="body2" color="textSecondary">
            Settlement date is the date the advance arrived or will arrive to
            the recipient.
          </Typography>
        </Box>
      </Box>
      <Box mt={3}>
        <FormControl className={classes.inputField}>
          <CurrencyTextField
            disabled
            label="Amount"
            currencySymbol="$"
            outputFormat="string"
            textAlign="left"
            value={payment.amount}
          />
        </FormControl>
      </Box>
    </Box>
  );
}

export default PaymentAdvanceForm;
