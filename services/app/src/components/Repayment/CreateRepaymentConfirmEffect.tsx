// This component shows all the details about their repayment
// before the user either clicks "Schedule" in the case of reverse_ach
// or "Close" in the case of all other payment types.
import { Box, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import LoansBeforeAfterPaymentPreview from "components/Repayment/LoansBeforeAfterPaymentPreview";
import BankToBankTransfer, {
  PaymentTransferType,
} from "components/Shared/BankToBankTransfer";
import CompanyBank from "components/Shared/BankToBankTransfer/CompanyBank";
import { BankAccounts, PaymentsInsertInput } from "generated/graphql";
import { formatCurrency } from "lib/currency";
import { PaymentMethodEnum } from "lib/enum";
import { LoanBeforeAfterPayment } from "lib/types";
import { useCallback } from "react";

interface Props {
  loansBeforeAfterPayment: LoanBeforeAfterPayment[];
  payment: PaymentsInsertInput;
  setPayment: (payment: PaymentsInsertInput) => void;
}

function CreateRepaymentConfirmEffect({
  loansBeforeAfterPayment,
  payment,
  setPayment,
}: Props) {
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
        <Typography>
          Step 2 of 2: Review expected effect of payment, in the form of
          balances of loans before vs balances of loans after payment, specify
          payment information, and submit payment.
        </Typography>
      </Box>
      <Box mt={2}>
        <LoansBeforeAfterPaymentPreview
          loansBeforeAfterPayment={loansBeforeAfterPayment}
        />
      </Box>
      <Box mt={2}>
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
