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
import {
  Companies,
  Loans,
  PaymentsInsertInput,
  ProductTypeEnum,
} from "generated/graphql";
import { formatCurrency } from "lib/currency";
import { formatDateString } from "lib/date";
import { LoanBeforeAfterPayment } from "lib/types";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    inputField: {
      width: 300,
    },
  })
);

interface Props {
  productType: ProductTypeEnum | null;
  payableAmountPrincipal: number;
  payableAmountInterest: number;
  paymentAmountPrincipal: number;
  paymentAmountInterest: number;
  payment: PaymentsInsertInput;
  customer: Companies;
  loansBeforeAfterPayment: LoanBeforeAfterPayment[];
  setLoanBeforeAfterPayment: (
    loanId: Loans["id"],
    field: string,
    value: number
  ) => void;
  setPayment: (payment: PaymentsInsertInput) => void;
  setPaymentAmountPrincipal: (amount: number) => void;
  setPaymentAmountInterest: (amount: number) => void;
}

function SettleRepaymentConfirmEffect({
  productType,
  payableAmountPrincipal,
  payableAmountInterest,
  paymentAmountPrincipal,
  paymentAmountInterest,
  loansBeforeAfterPayment,
  payment,
  customer,
  setLoanBeforeAfterPayment,
  setPayment,
  setPaymentAmountPrincipal,
  setPaymentAmountInterest,
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
      {productType === ProductTypeEnum.LineOfCredit ? (
        <Box display="flex" flexDirection="column" mt={3}>
          <Box mb={1}>
            <Typography variant="subtitle2">
              Step 3: review / edit how payment will be applied to loan(s).
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column">
            <Typography variant="body1">
              {`Before payment balances are as of the settlement date, ${formatDateString(
                payment.settlement_date
              )}.`}
            </Typography>
          </Box>
          <Box mt={1}>
            <Typography variant="body1">
              {`Outstanding Principal: ${formatCurrency(
                payableAmountPrincipal
              )}`}
            </Typography>
          </Box>
          <Box mt={1}>
            <Typography variant="body1">
              {`Outstanding Interest: ${formatCurrency(payableAmountInterest)}`}
            </Typography>
          </Box>
          <Box mt={1}>
            <FormControl className={classes.inputField}>
              <CurrencyTextField
                label="Payment Amount to Principal"
                currencySymbol="$"
                outputFormat="number"
                textAlign="left"
                value={paymentAmountPrincipal}
                onChange={(_event: any, value: number) => {
                  setPaymentAmountPrincipal(value);
                  setPayment({
                    ...payment,
                    amount: value + paymentAmountInterest,
                  });
                }}
              />
            </FormControl>
          </Box>
          <Box mt={1}>
            <FormControl className={classes.inputField}>
              <CurrencyTextField
                label="Payment Amount to Interest"
                currencySymbol="$"
                outputFormat="number"
                textAlign="left"
                value={paymentAmountInterest}
                onChange={(_event: any, value: number) => {
                  setPaymentAmountInterest(value);
                  setPayment({
                    ...payment,
                    amount: value + paymentAmountPrincipal,
                  });
                }}
              />
            </FormControl>
          </Box>
          <Box mt={1}>
            <Typography variant="body1">
              {`Calculated Payment Amount: ${formatCurrency(
                paymentAmountPrincipal + paymentAmountInterest
              )}`}
            </Typography>
          </Box>
        </Box>
      ) : (
        <Box display="flex" flexDirection="column" mt={3}>
          <Box mb={1}>
            <Typography variant="subtitle2">
              Step 3: review / edit how payment will be applied to loan(s).
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column">
            <Typography variant="body1">
              {`Before payment balances are as of the settlement date, ${formatDateString(
                payment.settlement_date
              )}.`}
            </Typography>
          </Box>
          <LoansBeforeAfterPaymentPreview
            isSettlePayment
            loansBeforeAfterPayment={loansBeforeAfterPayment}
            setLoanBeforeAfterPayment={setLoanBeforeAfterPayment}
          />
        </Box>
      )}
      {productType !== ProductTypeEnum.LineOfCredit && (
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
      )}
    </Box>
  );
}

export default SettleRepaymentConfirmEffect;
