import { Box, Divider, FormControl, Typography } from "@material-ui/core";
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
import { LoanBeforeAfterPayment } from "lib/finance/payments/repayment";

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
      <Box>
        <Typography variant={"h6"}>Review payment</Typography>
      </Box>
      <Box>
        <Typography variant={"body2"}>
          Confirm payment details are all correct.
        </Typography>
      </Box>
      <Box my={6}>
        <Divider light />
      </Box>
      <Box>
        {productType === ProductTypeEnum.LineOfCredit ? (
          <Box display="flex" flexDirection="column" mt={4}>
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
            <Box mt={2}>
              <Typography variant="body1">
                {`Total Amount: ${formatCurrency(payment.amount)}`}
              </Typography>
            </Box>
            <Box display="flex" flexDirection="column" mt={2}>
              <FormControl>
                <CurrencyInput
                  label={"Amount To Principal"}
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
            <Box display="flex" flexDirection="column" mt={2}>
              <FormControl>
                <CurrencyInput
                  label={"Amount To Interest"}
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
            <Box display="flex" flexDirection="column" mt={2}>
              <FormControl>
                <CurrencyInput
                  label={"Amount To Account Fees"}
                  value={payment.items_covered.to_account_fees}
                  handleChange={(value) =>
                    setPayment({
                      ...payment,
                      items_covered: {
                        ...payment.items_covered,
                        to_account_fees: value,
                      },
                    })
                  }
                />
              </FormControl>
            </Box>
          </Box>
        ) : (
          <Box display="flex" flexDirection="column" mt={4}>
            <Box mb={2}>
              <Typography variant="body1">
                {`Total Amount: ${formatCurrency(payment.amount)}`}
              </Typography>
            </Box>
            <Box display="flex" flexDirection="column" mb={1}>
              <Typography variant="body1">
                {`"Loans before repayment" balances are as of the settlement date, ${formatDateString(
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
      <Box display="flex" flexDirection="column" mt={4}>
        <Box display="flex" flexDirection="column" mt={2}>
          <FormControl>
            <CurrencyInput
              label={"Amount To Account Fees"}
              value={payment.items_covered.to_account_fees}
              handleChange={(value) =>
                setPayment({
                  ...payment,
                  items_covered: {
                    ...payment.items_covered,
                    to_account_fees: value,
                  },
                })
              }
            />
          </FormControl>
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          <FormControl>
            <CurrencyInput
              label={"Amount To Holding Account"}
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
    </Box>
  );
}
