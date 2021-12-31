import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@material-ui/core";
import CurrencyInput from "components/Shared/FormInputs/CurrencyInput";
import DateInput from "components/Shared/FormInputs/DateInput";
import {
  PaymentsInsertInput,
  TransactionsInsertInput,
} from "generated/graphql";
import { AllFeeWaiverTypes, FeeTypeEnum, FeeWaiverTypeToLabel } from "lib/enum";

interface Props {
  payment: PaymentsInsertInput;
  transaction: TransactionsInsertInput;
  setPayment: (payment: PaymentsInsertInput) => void;
  setTransaction: (transaction: TransactionsInsertInput) => void;
}

export default function FeeWaiverForm({
  payment,
  transaction,
  setPayment,
  setTransaction,
}: Props) {
  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" flexDirection="column" mt={4}>
        <Typography variant="subtitle2">
          What type of fee waiver is this?
        </Typography>
        <Box display="flex" flexDirection="column" mt={1}>
          <FormControl>
            <InputLabel id="select-fee-waiver-type-label">
              Fee Waiver Type
            </InputLabel>
            <Select
              id="select-fee-waiver-type"
              labelId="select-fee-waiver-type-label"
              value={transaction.subtype || ""}
              onChange={({ target: { value } }) =>
                setTransaction({
                  ...transaction,
                  subtype: value as FeeTypeEnum,
                })
              }
            >
              {AllFeeWaiverTypes.map((feeType) => {
                return (
                  <MenuItem key={feeType} value={feeType}>
                    {FeeWaiverTypeToLabel[feeType]}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <DateInput
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
              label={"Fee Waiver Amount"}
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
