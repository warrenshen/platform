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
import { AllFeeTypes, FeeTypeEnum, FeeTypeToLabel } from "lib/enum";

interface Props {
  payment: PaymentsInsertInput;
  transaction: TransactionsInsertInput;
  setPayment: (payment: PaymentsInsertInput) => void;
  setTransaction: (transaction: TransactionsInsertInput) => void;
}

export default function FeeForm({
  payment,
  transaction,
  setPayment,
  setTransaction,
}: Props) {
  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" flexDirection="column" mt={4}>
        <Typography variant="subtitle2">What type of fee is this?</Typography>
        <Box display="flex" flexDirection="column" mt={1}>
          <FormControl>
            <InputLabel id="select-fee-type-label">Fee Type</InputLabel>
            <Select
              id="select-fee-type"
              labelId="select-fee-type-label"
              value={transaction.subtype || ""}
              onChange={({ target: { value } }) =>
                setTransaction({
                  ...transaction,
                  subtype: value as FeeTypeEnum,
                })
              }
            >
              {AllFeeTypes.map((feeType) => {
                return (
                  <MenuItem key={feeType} value={feeType}>
                    {FeeTypeToLabel[feeType]}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <DateInput
          disableNonBankDays
          id="deposit-date-date-picker"
          label="Deposit Date"
          value={payment.deposit_date}
          onChange={(value) =>
            setPayment({
              ...payment,
              deposit_date: value,
            })
          }
        />
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <DateInput
          disableNonBankDays
          id="settlement-date-date-picker"
          label="Settlement Date"
          value={payment.settlement_date}
          onChange={(value) =>
            setPayment({
              ...payment,
              settlement_date: value,
            })
          }
        />
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <Typography variant="subtitle2">How much is the fee for?</Typography>
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
