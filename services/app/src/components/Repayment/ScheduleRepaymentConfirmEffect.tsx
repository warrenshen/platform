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
  setPayment: (payment: PaymentsInsertInput) => void;
}

function ScheduleRepaymentConfirmEffect({
  productType,
  payableAmountPrincipal,
  payableAmountInterest,
  loansBeforeAfterPayment,
  payment,
  customer,
  setPayment,
}: Props) {
  const classes = useStyles();

  return (
    <Box>
      <Box display="flex" flexDirection="column">
        <Typography variant="body1">
          {`${customer.name} requested the following Reverse Draft ACH:`}
        </Typography>
        <Box mt={1}>
          <RequestedRepaymentPreview payment={payment} />
        </Box>
      </Box>
      {productType === ProductTypeEnum.LineOfCredit ? (
        <Box mt={3}>
          <Box display="flex" flexDirection="column">
            <Typography variant="body1">
              {`As of the settlement date, ${formatDateString(
                payment.settlement_date
              )}, ${
                customer.name
              } will have the following outstanding principal and interest:`}
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
          <Box mt={3}>
            <Typography variant="subtitle2">
              How much of payment will go to outstanding principal?
            </Typography>
            <Box mt={1}>
              <FormControl className={classes.inputField}>
                <CurrencyInput
                  label={"Payment Amount to Principal"}
                  value={payment.items_covered.to_principal}
                  handleChange={(value: number) => {
                    setPayment({
                      ...payment,
                      amount: value + payment.items_covered.to_interest,
                      items_covered: {
                        ...payment.items_covered,
                        to_principal: value,
                      },
                    });
                  }}
                />
              </FormControl>
            </Box>
          </Box>
          <Box mt={3}>
            <Typography variant="subtitle2">
              How much of payment will go to outstanding interest?
            </Typography>
            <Box mt={1}>
              <FormControl className={classes.inputField}>
                <CurrencyInput
                  label={"Payment Amount to Interest"}
                  value={payment.items_covered.to_interest}
                  handleChange={(value: number) => {
                    setPayment({
                      ...payment,
                      amount: value + payment.items_covered.to_principal,
                      items_covered: {
                        ...payment.items_covered,
                        to_interest: value,
                      },
                    });
                  }}
                />
              </FormControl>
            </Box>
          </Box>
          <Box mt={3}>
            <Typography variant="body1">
              {`Calculated Payment Amount: ${formatCurrency(
                payment.items_covered.to_principal +
                  payment.items_covered.to_interest
              )}`}
            </Typography>
          </Box>
        </Box>
      ) : (
        <Box mt={3}>
          <Box>
            <Typography>
              Step 2 of 2: Review expected effect of payment, in the form of
              balances of loans before vs balances of loans after payment,
              specify payment information, and submit payment.
            </Typography>
          </Box>
          <Box mt={2}>
            <LoansBeforeAfterPaymentPreview
              isSettlePayment={false}
              loansBeforeAfterPayment={loansBeforeAfterPayment}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default ScheduleRepaymentConfirmEffect;
