import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@material-ui/core";
import CurrencyTextField from "@unicef/material-ui-currency-textfield";
import LoansDataGrid from "components/Shared/Loans/LoansDataGrid";
import { LoanFragment, PaymentsInsertInput } from "generated/graphql";
import { PaymentMethodEnum, PaymentMethodToLabel } from "lib/enum";

interface Props {
  payment: PaymentsInsertInput;
  selectedLoans: LoanFragment[];
  setPayment: (payment: PaymentsInsertInput) => void;
}

function PaymentAdvanceForm({ payment, selectedLoans, setPayment }: Props) {
  return (
    <Box display="flex" flexDirection="column">
      <Box mt={3}>
        <Typography>
          You are recording advances(s) for the following loans. Please select
          the payment method which was used and then press "Submit".
        </Typography>
      </Box>
      <Box mt={3}>
        <LoansDataGrid
          loans={selectedLoans}
          customerSearchQuery={""}
        ></LoansDataGrid>
      </Box>
      <Box mt={3}>
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
          style={{ width: 200 }}
        >
          {[PaymentMethodEnum.ACH, PaymentMethodEnum.Wire].map(
            (paymentMethod) => (
              <MenuItem key={paymentMethod} value={paymentMethod}>
                {PaymentMethodToLabel[paymentMethod]}
              </MenuItem>
            )
          )}
        </Select>
      </Box>
      <Box mt={3}>
        <FormControl fullWidth>
          <CurrencyTextField
            disabled
            label="Amount"
            currencySymbol="$"
            outputFormat="string"
            textAlign="left"
            value={payment.amount}
          ></CurrencyTextField>
        </FormControl>
      </Box>
    </Box>
  );
}

export default PaymentAdvanceForm;
