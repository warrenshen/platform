import {
  Box,
  createStyles,
  FormControl,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import LoansBeforeAfterPaymentPreview from "components/Repayment/LoansBeforeAfterPaymentPreview";
import RequestedRepaymentPreview from "components/Repayment/RequestedRepaymentPreview";
import CompanyBank from "components/Shared/BankToBankTransfer/CompanyBank";
import CurrencyInput from "components/Shared/FormInputs/CurrencyInput";
import {
  BankAccounts,
  Companies,
  PaymentsInsertInput,
  ProductTypeEnum,
} from "generated/graphql";
import { formatCurrency } from "lib/currency";
import { formatDateString } from "lib/date";
import { PaymentMethodEnum } from "lib/enum";
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
        <Typography variant="body2">
          {`${customer.name} submitted the following payment:`}
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
      <Box mt={2}>
        {payment.requested_amount <= 0 && (
          <Box>No amount is currently due. No further action is required</Box>
        )}
        {payment.requested_amount > 0 && (
          <Box>
            {payment.method === PaymentMethodEnum.ReverseDraftACH && (
              <Box>
                <Box mb={2}>
                  <Typography variant="body1">
                    Please specify which bank account you want Bespoke to
                    withdraw the payment amount from.
                  </Typography>
                </Box>
                <CompanyBank
                  companyId={payment.company_id}
                  onCompanyBankAccountSelection={(id: BankAccounts["id"]) =>
                    setPayment({ ...payment, company_bank_account_id: id })
                  }
                />
                <Box mt={2}>
                  <Alert severity="info">
                    Click "Schedule" for Bespoke to initiate this transfer for{" "}
                    <b>{formatCurrency(payment.requested_amount)}</b> from your
                    bank account.
                    <br />
                    <br />
                    Upon receipt Bespoke will mark this payment as "settled,"
                    and apply towards outstanding loans and fees accordingly.{" "}
                  </Alert>{" "}
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default ScheduleRepaymentConfirmEffect;
