// This component shows all the details about their repayment
// before the user either clicks "Schedule" in the case of reverse_ach
// or "Close" in the case of all other payment types.
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
import BankToBankTransfer, {
  PaymentTransferType,
} from "components/Shared/BankToBankTransfer";
import CompanyBank from "components/Shared/BankToBankTransfer/CompanyBank";
import CurrencyInput from "components/Shared/FormInputs/CurrencyInput";
import {
  BankAccounts,
  PaymentsInsertInput,
  ProductTypeEnum,
} from "generated/graphql";
import { formatCurrency } from "lib/currency";
import { formatDateString } from "lib/date";
import { PaymentMethodEnum } from "lib/enum";
import { LoanBeforeAfterPayment } from "lib/types";
import { useCallback } from "react";

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
  loansBeforeAfterPayment: LoanBeforeAfterPayment[];
  setPayment: (payment: PaymentsInsertInput) => void;
}

function CreateRepaymentConfirmEffect({
  productType,
  payableAmountPrincipal,
  payableAmountInterest,
  loansBeforeAfterPayment,
  payment,
  setPayment,
}: Props) {
  const classes = useStyles();

  const onBespokeBankAccountSelection = useCallback(
    (id: BankAccounts["id"]) => {
      setPayment({
        ...payment,
        bespoke_bank_account_id: id,
      });
    },
    [payment, setPayment]
  );

  const onCompanyBankAccountSelection = useCallback(
    (id: BankAccounts["id"]) => {
      setPayment({
        ...payment,
        company_bank_account_id: id,
      });
    },
    [payment, setPayment]
  );

  return (
    <Box>
      {productType === ProductTypeEnum.LineOfCredit ? (
        <Box>
          <Box display="flex" flexDirection="column">
            <Typography variant="body1">
              {`As of the settlement date, ${formatDateString(
                payment.settlement_date
              )}, your outstanding principal and interest will be:`}
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
              How much of your outstanding principal do you want to pay for?
            </Typography>
            <Box mt={1}>
              <FormControl className={classes.inputField}>
                <CurrencyInput
                  label={"Payment Amount to Principal"}
                  value={payment.items_covered.to_principal}
                  handleChange={(value: number) => {
                    setPayment({
                      ...payment,
                      requested_amount:
                        value + payment.items_covered.to_interest,
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
              How much of your outstanding interest do you want to pay for?
            </Typography>
            <Box mt={1}>
              <FormControl className={classes.inputField}>
                <CurrencyInput
                  label={"Payment Amount to Interest"}
                  value={payment.items_covered.to_interest}
                  handleChange={(value: number) => {
                    setPayment({
                      ...payment,
                      requested_amount:
                        value + payment.items_covered.to_principal,
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
        <>
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
        </>
      )}
      <Box mt={2}>
        {payment.requested_amount <= 0 && (
          <Box>No amount is currently due. No further action is required</Box>
        )}
        {payment.requested_amount > 0 && (
          <Box>
            {[PaymentMethodEnum.ACH, PaymentMethodEnum.Wire].includes(
              payment.method as PaymentMethodEnum
            ) && (
              <>
                <BankToBankTransfer
                  type={(payment.type || "") as PaymentTransferType}
                  companyId={payment.company_id}
                  onBespokeBankAccountSelection={onBespokeBankAccountSelection}
                  onCompanyBankAccountSelection={onCompanyBankAccountSelection}
                />
                <Box mt={2}>
                  <Alert severity="warning">
                    After clicking "Notify", you must initiate this transfer for{" "}
                    <b>{formatCurrency(payment.requested_amount)}</b> from your
                    bank account. Upon receipt Bespoke will mark this payment as
                    "settled," and apply towards outstanding loans and fees
                    accordingly.
                  </Alert>
                </Box>
              </>
            )}
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
            {payment.method === PaymentMethodEnum.Cash && (
              <Box mt={2}>
                <Alert severity="info">
                  After clicking "Notify", We will coordinate the collection of{" "}
                  <b>{formatCurrency(payment.requested_amount)}</b>. Please
                  reach out to Bespoke support. This method of payment will
                  incur a $100 fee.
                </Alert>
              </Box>
            )}
            {payment.method === PaymentMethodEnum.Check && (
              <Box mt={2}>
                <Alert severity="info">
                  After clicking "Notify", please make the check payable to
                  Bespoke Financial for{" "}
                  <b>{formatCurrency(payment.requested_amount)}</b>
                </Alert>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default CreateRepaymentConfirmEffect;
