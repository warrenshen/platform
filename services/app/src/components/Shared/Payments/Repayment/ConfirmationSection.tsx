// This component shows all the details about their repayment
// before the user either clicks "Schedule" in the case of reverse_ach
// or "Close" in the case of all other payment types.
import { Box } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import BankToBankTransfer, {
  PaymentTransferType,
} from "components/Shared/BankToBankTransfer";
import CompanyBank from "components/Shared/BankToBankTransfer/CompanyBank";
import { BankAccounts, PaymentsInsertInput } from "generated/graphql";
import { formatCurrency } from "lib/currency";
import { PaymentMethodEnum } from "lib/enum";
import { useCallback } from "react";

interface Props {
  payment: PaymentsInsertInput;
  setPayment: React.Dispatch<React.SetStateAction<PaymentsInsertInput>>;
}

function ConfirmationSection({ payment, setPayment }: Props) {
  const onBespokeBankAccountSelection = useCallback(
    (id: BankAccounts["id"]) => {
      setPayment((payment) => {
        return { ...payment, bespoke_bank_account_id: id };
      });
    },
    [setPayment]
  );

  const onCompanyBankAccountSelection = useCallback(
    (id: BankAccounts["id"]) => {
      setPayment((payment) => {
        return { ...payment, company_bank_account_id: id };
      });
    },
    [setPayment]
  );

  return (
    <>
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
              ></BankToBankTransfer>
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
          {PaymentMethodEnum.ReverseDraftACH === payment.method && (
            <>
              <CompanyBank
                companyId={payment.company_id}
                onCompanyBankAccountSelection={(id: BankAccounts["id"]) =>
                  setPayment({ ...payment, company_bank_account_id: id })
                }
              ></CompanyBank>
              <Box mt={2}>
                <Alert severity="info">
                  Click "Schedule" for Bespoke to initiate this transfer for{" "}
                  <b>{formatCurrency(payment.amount)}</b> from your bank
                  account.
                  <br />
                  <br />
                  Upon receipt Bespoke will mark this payment as "settled," and
                  apply towards outstanding loans and fees accordingly.{" "}
                </Alert>{" "}
              </Box>
            </>
          )}
          {PaymentMethodEnum.Cash === payment.method && (
            <Box mt={2}>
              <Alert severity="info">
                After clicking "Notify", We will coordinate the collection of{" "}
                <b>{formatCurrency(payment.amount)}</b>. Please reach out to
                Bespoke support. This method of payment will incur a $100 fee.
              </Alert>
            </Box>
          )}
          {PaymentMethodEnum.Check === payment.method && (
            <Box mt={2}>
              <Alert severity="info">
                After clicking "Notify", please make the check payable to
                Bespoke Financial for <b>{formatCurrency(payment.amount)}</b>
              </Alert>
            </Box>
          )}
        </Box>
      )}
    </>
  );
}

export default ConfirmationSection;
