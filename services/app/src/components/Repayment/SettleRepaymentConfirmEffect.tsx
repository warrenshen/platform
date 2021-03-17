import {
  Box,
  createStyles,
  FormControl,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import LoansBeforeAfterPaymentPreview from "components/Repayment/LoansBeforeAfterPaymentPreview";
import RequestedRepaymentPreview from "components/Repayment/RequestedRepaymentPreview";
import CurrencyInput from "components/Shared/FormInputs/CurrencyInput";
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
  productType,
  payableAmountPrincipal,
  payableAmountInterest,
  loansBeforeAfterPayment,
  payment,
  customer,
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
              <CurrencyInput
                label={"Payment Amount to Principal"}
                value={payment.items_covered.to_principal}
                handleChange={(value: number) =>
                  setPayment({
                    ...payment,
                    amount: value + payment.items_covered.to_interest,
                    items_covered: {
                      ...payment.items_covered,
                      to_principal: value,
                    },
                  })
                }
              />
            </FormControl>
          </Box>
          <Box mt={1}>
            <FormControl className={classes.inputField}>
              <CurrencyInput
                label={"Payment Amount to Interest"}
                value={payment.items_covered.to_interest}
                handleChange={(value: number) =>
                  setPayment({
                    ...payment,
                    amount: value + payment.items_covered.to_principal,
                    items_covered: {
                      ...payment.items_covered,
                      to_interest: value,
                    },
                  })
                }
              />
            </FormControl>
          </Box>
          <Box mt={1}>
            <Typography variant="body1">
              {`Calculated Payment Amount: ${formatCurrency(
                payment.items_covered.to_principal +
                  payment.items_covered.to_interest
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
    </Box>
  );
}

export default SettleRepaymentConfirmEffect;
