import { Box, FormControl, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import LoansBeforeAfterPaymentPreview from "components/Repayment/LoansBeforeAfterPaymentPreview";
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
    value: number | null
  ) => void;
  setPayment: (payment: PaymentsInsertInput) => void;
}

export default function SettleRepaymentConfirmEffect({
  productType,
  payableAmountPrincipal,
  payableAmountInterest,
  loansBeforeAfterPayment,
  payment,
  customer,
  setLoanBeforeAfterPayment,
  setPayment,
}: Props) {
  return (
    <Box>
      {productType === ProductTypeEnum.LineOfCredit ? (
        <Box display="flex" flexDirection="column" mt={4}>
          <Box mb={1}>
            <Typography variant="subtitle2">
              Review / edit how payment will be applied.
            </Typography>
          </Box>
          <Alert severity="info">
            <Box display="flex" flexDirection="column">
              <Typography variant="body1">
                {`As of the settlement date, ${formatDateString(
                  payment.settlement_date
                )}, ${customer.name}'s balances will be:`}
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
                {`Outstanding Interest: ${formatCurrency(
                  payableAmountInterest
                )}`}
              </Typography>
            </Box>
          </Alert>
          <Box mt={1}>
            <Typography variant="body1">
              {`Payment Amount: ${formatCurrency(payment.amount)}`}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" mt={1}>
            <FormControl>
              <CurrencyInput
                label={"Payment Amount to Principal"}
                value={payment.items_covered.to_principal}
                handleChange={(value) =>
                  setPayment({
                    ...payment,
                    items_covered: {
                      ...payment.items_covered,
                      to_principal: value,
                    },
                  })
                }
              />
            </FormControl>
          </Box>
          <Box display="flex" flexDirection="column" mt={1}>
            <FormControl>
              <CurrencyInput
                label={"Payment Amount to Interest"}
                value={payment.items_covered.to_interest}
                handleChange={(value) =>
                  setPayment({
                    ...payment,
                    items_covered: {
                      ...payment.items_covered,
                      to_interest: value,
                    },
                  })
                }
              />
            </FormControl>
          </Box>
        </Box>
      ) : (
        <Box display="flex" flexDirection="column" mt={4}>
          <Box mb={1}>
            <Typography variant="subtitle2">
              Review / edit how payment will be applied to loan(s).
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
      <Box display="flex" flexDirection="column" mt={4}>
        <FormControl>
          <CurrencyInput
            label={"Payment Amount to Holding Account"}
            value={payment.items_covered.to_user_credit}
            handleChange={(value) =>
              setPayment({
                ...payment,
                items_covered: {
                  ...payment.items_covered,
                  to_user_credit: value,
                },
              })
            }
          />
        </FormControl>
      </Box>
    </Box>
  );
}
