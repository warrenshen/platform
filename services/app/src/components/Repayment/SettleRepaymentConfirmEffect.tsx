import {
  Box,
  createStyles,
  FormControl,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import CurrencyTextField from "@unicef/material-ui-currency-textfield";
import LoansBeforeAfterPaymentPreview from "components/Repayment/LoansBeforeAfterPaymentPreview";
import RequestedRepaymentPreview from "components/Repayment/RequestedRepaymentPreview";
import { Companies, Loans, PaymentsInsertInput } from "generated/graphql";
import { LoanBeforeAfterPayment } from "lib/types";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    inputField: {
      width: 300,
    },
  })
);

interface Props {
  payment: PaymentsInsertInput;
  customer: Companies;
  loansBeforeAfterPayment: LoanBeforeAfterPayment[];
  setLoanBeforeAfterPayment: (
    loanId: Loans["id"],
    field: string,
    value: number
  ) => void;
  setPayment: (payment: PaymentsInsertInput) => void;
}

function SettleRepaymentConfirmEffect({
  payment,
  customer,
  loansBeforeAfterPayment,
  setLoanBeforeAfterPayment,
  setPayment,
}: Props) {
  const classes = useStyles();

  return (
    <Box>
      <Box display="flex" flexDirection="column">
        <Typography variant="body2">
          {`${customer.name} submitted the following payment:`}
        </Typography>
        <Box mt={1}>
          <RequestedRepaymentPreview payment={payment} />
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" mt={3}>
        <Box mb={1}>
          <Typography variant="subtitle2">
            Step 3: review / edit how payment will be applied to loan(s).
          </Typography>
        </Box>
        <LoansBeforeAfterPaymentPreview
          isSettlePayment
          loansBeforeAfterPayment={loansBeforeAfterPayment}
          setLoanBeforeAfterPayment={setLoanBeforeAfterPayment}
        />
      </Box>
      <Box display="flex" flexDirection="column" mt={3}>
        <Box mb={1}>
          <Typography variant="subtitle2">
            Step 4: finalize actual payment amount (this may be different from
            the requested payment amount).
          </Typography>
        </Box>
        <FormControl className={classes.inputField}>
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
    </Box>
  );
}

export default SettleRepaymentConfirmEffect;
