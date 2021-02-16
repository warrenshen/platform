// This component shows all the details about their repayment
// before the user either clicks "Schedule" in the case of reverse_ach
// or "Close" in the case of all other payment types.
import {
  Box,
  createStyles,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import { ArrowRightAlt } from "@material-ui/icons";
import { Alert } from "@material-ui/lab";
import BankToBankTransfer, {
  PaymentTransferType,
} from "components/Shared/BankToBankTransfer";
import CompanyBank from "components/Shared/BankToBankTransfer/CompanyBank";
import { BankAccounts, PaymentsInsertInput } from "generated/graphql";
import { formatCurrency } from "lib/currency";
import { PaymentMethodEnum } from "lib/enum";
import { BeforeAfterPaymentLoan } from "lib/types";
import { useCallback } from "react";
import LoanBalancesDataGrid from "./LoanBalancesDataGrid";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    beforeAfterPaymentLoan: {
      display: "flex",
      alignItems: "center",

      width: "100%",
    },
    middle: {
      display: "flex",
      justifyContent: "center",
      width: 40,
    },
    beforePaymentLoan: {
      display: "flex",
      justifyContent: "flex-end",

      flex: 1,
    },
    afterPaymentLoan: {
      flex: 1,
    },
  })
);

interface Props {
  beforeAfterPaymentLoans: BeforeAfterPaymentLoan[];
  payment: PaymentsInsertInput;
  setPayment: (payment: PaymentsInsertInput) => void;
}

function CreateRepaymentConfirmEffect({
  beforeAfterPaymentLoans,
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
      <Box>
        <Box className={classes.beforeAfterPaymentLoan}>
          <Box className={classes.beforePaymentLoan}>
            <Typography variant="h6">Loans before payment</Typography>
          </Box>
          <Box className={classes.middle}>
            <ArrowRightAlt />
          </Box>
          <Box className={classes.afterPaymentLoan}>
            <Typography variant="h6">Loans after payment</Typography>
          </Box>
        </Box>
        <Box className={classes.beforeAfterPaymentLoan}>
          <Box className={classes.beforePaymentLoan}>
            <LoanBalancesDataGrid
              loanBalances={beforeAfterPaymentLoans.map(
                (beforeAfterPaymentLoan) => ({
                  ...beforeAfterPaymentLoan.loan_balance_before,
                  id: beforeAfterPaymentLoan.loan_id,
                })
              )}
            />
          </Box>
          <Box className={classes.middle}>
            <ArrowRightAlt />
          </Box>
          <Box className={classes.afterPaymentLoan}>
            <LoanBalancesDataGrid
              loanBalances={beforeAfterPaymentLoans.map(
                (beforeAfterPaymentLoan) => ({
                  ...beforeAfterPaymentLoan.loan_balance_after,
                  id: beforeAfterPaymentLoan.loan_id,
                })
              )}
            />
          </Box>
        </Box>
      </Box>
      <Box mt={4}>
        {payment.amount <= 0 && (
          <Box>No amount is currently due. No further action is required</Box>
        )}
        {payment.amount > 0 && (
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
                    <b>{formatCurrency(payment.amount)}</b> from your bank
                    account. Upon receipt Bespoke will mark this payment as
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
                    <b>{formatCurrency(payment.amount)}</b> from your bank
                    account.
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
                  <b>{formatCurrency(payment.amount)}</b>. Please reach out to
                  Bespoke support. This method of payment will incur a $100 fee.
                </Alert>
              </Box>
            )}
            {payment.method === PaymentMethodEnum.Check && (
              <Box mt={2}>
                <Alert severity="info">
                  After clicking "Notify", please make the check payable to
                  Bespoke Financial for <b>{formatCurrency(payment.amount)}</b>
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
