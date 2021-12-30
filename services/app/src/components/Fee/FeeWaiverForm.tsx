import { Box, FormControl, Typography } from "@material-ui/core";
import CurrencyInput from "components/Shared/FormInputs/CurrencyInput";
import DateInput from "components/Shared/FormInputs/DateInput";
import { PaymentsInsertInput } from "generated/graphql";

interface Props {
  payment: PaymentsInsertInput;
  setPayment: (payment: PaymentsInsertInput) => void;
}

export default function FeeWaiverForm({ payment, setPayment }: Props) {
  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" flexDirection="column" mt={4}>
        <DateInput
          disableNonBankDays
          id="settlement-date-date-picker"
          label="Fee Waiver Date"
          value={payment.settlement_date}
          onChange={(value) =>
            setPayment({
              ...payment,
              deposit_date: value,
              settlement_date: value,
            })
          }
        />
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <Typography variant="subtitle2">
          How much is the fee waiver for?
        </Typography>
        <Box display="flex" flexDirection="column" mt={1}>
          <FormControl>
            <CurrencyInput
              label={"Amount"}
              value={payment.amount}
              handleChange={(value) =>
                setPayment({
                  ...payment,
                  amount: value,
                })
              }
            />
          </FormControl>
        </Box>
      </Box>
    </Box>
  );
}
