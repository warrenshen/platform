import { Box, Divider, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import BankAccountInfoCard from "components/BankAccount/BankAccountInfoCard";
import LoansBeforeAfterPaymentPreview from "components/Repayment/LoansBeforeAfterPaymentPreview";
import {
  Companies,
  PaymentsInsertInput,
  useBankAccountsForTransferQuery,
} from "generated/graphql";
import { formatCurrency } from "lib/number";
import {
  PaymentMethodEnum,
  PaymentMethodToLabel,
  ProductTypeEnum,
} from "lib/enum";
import { LoanBeforeAfterPayment } from "lib/finance/payments/repayment";

interface Props {
  companyId: Companies["id"];
  productType: ProductTypeEnum | null;
  payableAmountPrincipal: number;
  payableAmountInterest: number;
  payableAmountAccountFee: number;
  payment: PaymentsInsertInput;
  loansBeforeAfterPayment: LoanBeforeAfterPayment[];
  isPayAccountFeesVisible: boolean;
}

function getAlertText(payment: PaymentsInsertInput) {
  if (
    [PaymentMethodEnum.ACH, PaymentMethodEnum.Wire].includes(
      payment.method as PaymentMethodEnum
    )
  ) {
    return (
      <>
        After you press "Notify Bespoke Financial", you must initiate a transfer
        for <strong>{formatCurrency(payment.requested_amount)}</strong> from
        your bank account to Bespoke Financial. Upon receipt of this payment,
        Bespoke Financial will mark this payment as "settled" and apply it
        towards outstanding loans and fees accordingly.
      </>
    );
  } else if (payment.method === PaymentMethodEnum.ReverseDraftACH) {
    return (
      <>
        After you press "Schedule repayment", Bespoke Financial will initiate a
        reverse draft ACH of{" "}
        <strong>{formatCurrency(payment.requested_amount)}</strong> from your
        bank account.
        <br />
        <br />
        Upon receipt of this payment, Bespoke Financial will mark this payment
        as "settled" and apply it towards outstanding loans and fees
        accordingly.
      </>
    );
  } else if (payment.method === PaymentMethodEnum.Cash) {
    return (
      <>
        After you press "Notify Bespoke Financial", Bespoke Financial will
        coordinate with you on the collection of{" "}
        <strong>{formatCurrency(payment.requested_amount)}</strong>. This method
        of payment will incur a $100 fee.
      </>
    );
  } else {
    return (
      <>
        After you press "Notify Bespoke Financial", Bespoke Financial will
        coordinate with you on the collection of a check of{" "}
        <strong>{formatCurrency(payment.requested_amount)}</strong>. Please make
        the check payable to Bespoke Financial.
      </>
    );
  }
}

export default function CreateRepaymentConfirmEffect({
  companyId,
  productType,
  payableAmountPrincipal,
  payableAmountInterest,
  payableAmountAccountFee,
  loansBeforeAfterPayment,
  payment,
  isPayAccountFeesVisible,
}: Props) {
  const { data } = useBankAccountsForTransferQuery({
    fetchPolicy: "network-only",
    variables: {
      companyId,
    },
  });
  const bespokeCollectionsBankAccount =
    data?.companies_by_pk?.settings?.collections_bespoke_bank_account;

  return (
    <Box>
      <Box>
        <Typography variant={"h6"}>Review repayment</Typography>
      </Box>
      <Box>
        <Typography variant={"body2"}>
          Confirm repayment details are all correct.
        </Typography>
      </Box>
      <Box my={6}>
        <Divider light />
      </Box>
      <Box>
        {productType === ProductTypeEnum.LineOfCredit ? (
          <Box>
            <Box mb={2}>
              <Typography variant="body1">
                {`Total Amount: ${formatCurrency(payment.requested_amount)}`}
              </Typography>
            </Box>
            <Typography variant="body2">
              {`To Principal: ${formatCurrency(
                payment.items_covered.requested_to_principal
              )}`}
            </Typography>
            <Typography variant="body2">
              {`To Interest: ${formatCurrency(
                payment.items_covered.requested_to_interest,
                "$0.00"
              )}`}
            </Typography>
            {isPayAccountFeesVisible && (
              <Typography variant="body2">
                {`To Account Fees: ${formatCurrency(
                  payment.items_covered.requested_to_account_fees,
                  "$0.00"
                )}`}
              </Typography>
            )}
          </Box>
        ) : (
          <>
            <Box>
              <Box mb={2}>
                <Typography variant="body1">
                  {`Total Loan Amount: ${formatCurrency(
                    payment.requested_amount
                  )}`}
                </Typography>
                {isPayAccountFeesVisible && (
                  <Typography variant="body1">
                    {`Account Fees Amount: ${formatCurrency(
                      payment.items_covered.requested_to_account_fees,
                      "$0.00"
                    )}`}
                  </Typography>
                )}
              </Box>
            </Box>
            <LoansBeforeAfterPaymentPreview
              isSettlePayment={false}
              loansBeforeAfterPayment={loansBeforeAfterPayment}
            />
          </>
        )}
      </Box>
      <Box my={6}>
        <Divider light />
      </Box>
      <Box>
        {payment.requested_amount <= 0 ? (
          <Box>No amount is currently due. No further action is required</Box>
        ) : (
          <Box>
            <Box mb={2}>
              <Typography variant="h6">
                Important payment instructions
              </Typography>
            </Box>
            {[PaymentMethodEnum.ACH, PaymentMethodEnum.Wire].includes(
              payment.method as PaymentMethodEnum
            ) && (
              <>
                <Typography variant="body2">
                  {`Please send your ${
                    PaymentMethodToLabel[payment.method as PaymentMethodEnum]
                  } repayment to the following bank account:`}
                </Typography>
                <Box mt={2}>
                  {!!bespokeCollectionsBankAccount && (
                    <BankAccountInfoCard
                      bankAccount={bespokeCollectionsBankAccount}
                    />
                  )}
                </Box>
              </>
            )}
            <Box mt={4}>
              <Alert severity="info">
                <Typography variant="body1">{getAlertText(payment)}</Typography>
              </Alert>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
