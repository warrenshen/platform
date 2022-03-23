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
  TextField,
  Theme,
  Typography,
} from "@material-ui/core";
import DateInput from "components/Shared/FormInputs/DateInput";
import { PaymentsInsertInput } from "generated/graphql";
import { formatCurrency } from "lib/number";
import {
  AdvanceMethodEnum,
  AdvanceMethodToLabel,
  AllAdvanceMethods,
} from "lib/enum";
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
  setPayment: (payment: PaymentsInsertInput) => void;
  shouldChargeWireFee: boolean;
  setShouldChargeWireFee: (val: boolean) => void;
}

export default function AdvanceForm({
  payment,
  setPayment,
  shouldChargeWireFee,
  setShouldChargeWireFee,
}: Props) {
  const classes = useStyles();

  return (
    <Box display="flex" flexDirection="column">
      <Box mt={4}>
        <Typography variant="body2" color="textSecondary">
          Total Amount
        </Typography>
        <Typography variant="body1">
          {formatCurrency(payment.amount)}
        </Typography>
      </Box>
      <Box mt={4}>
        <FormControl className={classes.inputField}>
          <InputLabel id="select-payment-method-label" required>
            Advance Method
          </InputLabel>
          <Select
            id="select-payment-method"
            labelId="select-payment-method-label"
            value={payment.method}
            onChange={({ target: { value } }) =>
              setPayment({
                ...payment,
                method: value as AdvanceMethodEnum,
              })
            }
          >
            {AllAdvanceMethods.map((advanceMethod) => (
              <MenuItem key={advanceMethod} value={advanceMethod}>
                {AdvanceMethodToLabel[advanceMethod]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      {payment.method === AdvanceMethodEnum.Wire && (
        <Box mt={4}>
          <FormControlLabel
            control={
              <Checkbox
                checked={shouldChargeWireFee}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setShouldChargeWireFee(event.target.checked)
                }
                color="primary"
              />
            }
            label={"Charge Wire Fee?"}
          />
        </Box>
      )}
      <Box display="flex" flexDirection="column" mt={4}>
        <DateInput
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
            The date the advance was sent / will be sent{" "}
            <strong>to the bank</strong> (ex. export via CSV to Torrey Pines).
          </Typography>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <DateInput
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
            The date the advance arrived / will arrive{" "}
            <strong>to the recipient</strong> and the date interest starts to
            accrue.
          </Typography>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <TextField
          inputProps={{
            maxLength: 140,
          }}
          multiline
          label={"Memo (additional info for recipient)"}
          helperText={`[${(payment.bank_note || "").length}/${140}]`}
          value={payment.bank_note || ""}
          onChange={({ target: { value } }) =>
            setPayment({
              ...payment,
              bank_note: value,
            })
          }
        />
        <Box mt={1}>
          <Typography variant="body2" color="textSecondary">
            If Memo is left blank, the loan disbursement identifier(s) will be
            used.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
