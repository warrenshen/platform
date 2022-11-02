import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  MenuItem,
  TextField,
  Typography,
} from "@material-ui/core";
import VerticalValueAndLabel from "components/Repayment/v2/VerticalValueAndLabel";
import DateInput from "components/Shared/FormInputs/DateInput";
import { PaymentsInsertInput } from "generated/graphql";
import { DateInputIcon } from "icons";
import {
  AdvanceMethodEnum,
  AdvanceMethodToLabel,
  AllAdvanceMethods,
} from "lib/enum";
import { formatCurrency } from "lib/number";
import { ChangeEvent } from "react";

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
  return (
    <Box display="flex" flexDirection="column">
      <Box mt={4}>
        <VerticalValueAndLabel
          value={formatCurrency(payment.amount)}
          label={"Total loan amount"}
        />
      </Box>
      <Box mt={1}>
        <FormControl fullWidth>
          <TextField
            value={payment.method}
            onChange={({ target: { value } }) =>
              setPayment({
                ...payment,
                method: value as AdvanceMethodEnum,
              })
            }
            select
            variant="outlined"
            label="Advance Method"
          >
            {AllAdvanceMethods.map((advanceMethod) => (
              <MenuItem
                key={advanceMethod}
                value={advanceMethod}
                data-cy={`advance-form-select-payment-method-menu-item-${AdvanceMethodToLabel[advanceMethod]}`}
              >
                {AdvanceMethodToLabel[advanceMethod]}
              </MenuItem>
            ))}
          </TextField>
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
        <FormControl fullWidth>
          <DateInput
            disableNonBankDays
            id="payment-date-date-picker"
            label="Payment Date"
            value={payment.payment_date}
            onChange={(value) =>
              setPayment({
                ...payment,
                payment_date: value,
              })
            }
            keyboardIcon={<DateInputIcon width="16px" height="16px" />}
          />
        </FormControl>
        <Box mt={1}>
          <Typography variant="body2" color="textSecondary">
            The date the advance was sent / will be sent{" "}
            <strong>to the bank</strong> (ex. export via CSV to Torrey Pines).
          </Typography>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" mt={1}>
        <FormControl fullWidth>
          <DateInput
            disableNonBankDays
            id="settlement-date-date-picker"
            label="Deposit / Settlement Date"
            value={payment.settlement_date}
            onChange={(value) =>
              setPayment({
                ...payment,
                settlement_date: value,
              })
            }
            keyboardIcon={<DateInputIcon width="16px" height="16px" />}
          />
        </FormControl>
        <Box mt={1}>
          <Typography variant="body2" color="textSecondary">
            The date the advance arrived / will arrive{" "}
            <strong>to the recipient</strong> and the date interest starts to
            accrue.
          </Typography>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" mt={1}>
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
