import {
  Box,
  Checkbox,
  createStyles,
  FormControl,
  FormControlLabel,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  Theme,
  Typography,
} from "@material-ui/core";
import LoansDataGrid from "components/Loans/LoansDataGrid";
import CurrencyInput from "components/Shared/FormInputs/CurrencyInput";
import DatePicker from "components/Shared/FormInputs/DatePicker";
import { LoanFragment, PaymentsInsertInput } from "generated/graphql";
import { PaymentMethodEnum, PaymentMethodToLabel } from "lib/enum";
import { ChangeEvent } from "react";

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
  setPayment: (payment: PaymentsInsertInput) => void;
  shouldChargeWireFee: boolean;
  setShouldChargeWireFee: (val: boolean) => void;
}

function PaymentAdvanceForm({
  payment,
  selectedLoans,
  setPayment,
  shouldChargeWireFee,
  setShouldChargeWireFee,
}: Props) {
  const classes = useStyles();

  return (
    <Box display="flex" flexDirection="column">
      <Box mt={3}>
        <Typography>
          You are recording advances(s) for the following loans. Please enter in
          information for the advance(s) and then press "Submit".
        </Typography>
      </Box>
      <Box mt={3}>
        <LoansDataGrid
          isCompanyVisible
          isSortingDisabled
          isStatusVisible={false}
          loans={selectedLoans}
        />
      </Box>
      <Box mt={3}>
        <FormControl>
          <CurrencyInput isDisabled label={"Amount"} value={payment.amount} />
        </FormControl>
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
          disableNonBankDays
          className={classes.inputField}
          id="payment-date-date-picker"
          label="Payment Date"
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
            The date you sent or will send the advance out.
          </Typography>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" mt={3}>
        <DatePicker
          disableNonBankDays
          className={classes.inputField}
          id="settlement-date-date-picker"
          label="Deposit / Settlement Date"
          value={payment.settlement_date}
          onChange={(value) =>
            setPayment({
              ...payment,
              settlement_date: value,
            })
          }
        />
        <Box mt={1}>
          <Typography variant="body2" color="textSecondary">
            The date advance arrived or will arrive to the recipient.
          </Typography>
        </Box>
      </Box>
      {payment.method === PaymentMethodEnum.Wire && (
        <Box mt={3}>
          <FormControlLabel
            control={
              <Checkbox
                checked={shouldChargeWireFee}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  setShouldChargeWireFee(event.target.checked);
                }}
                color="primary"
              />
            }
            label={"Charge Wire Fee?"}
          />
          <Box>
            <Typography variant="body2" color="textSecondary">
              If there are multiple customers, a Wire Fee will be recorded for
              each customer.
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default PaymentAdvanceForm;
