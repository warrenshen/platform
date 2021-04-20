import { Box, Divider, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import BankAccountInfoCard from "components/BankAccount/BankAccountInfoCard";
import LoansBeforeAfterPaymentPreview from "components/Repayment/LoansBeforeAfterPaymentPreview";
import {
  Companies,
  PaymentsInsertInput,
  ProductTypeEnum,
  useBankAccountsForTransferQuery,
} from "generated/graphql";
import { formatCurrency } from "lib/currency";
import { PaymentMethodEnum, PaymentMethodToLabel } from "lib/enum";
import { LoanBeforeAfterPayment } from "lib/types";

interface Props {
  companyId: Companies["id"];
  productType: ProductTypeEnum | null;
  payableAmountPrincipal: number;
  payableAmountInterest: number;
  payment: PaymentsInsertInput;
  loansBeforeAfterPayment: LoanBeforeAfterPayment[];
}

function getAlertText(payment: PaymentsInsertInput) {
  if (
    [PaymentMethodEnum.ACH, PaymentMethodEnum.Wire].includes(
      payment.method as PaymentMethodEnum
    )
  ) {
    return (
      <>
        After you press "Notify bank", you must initiate a transfer for{" "}
        <b>{formatCurrency(payment.requested_amount)}</b> from your bank
        account. Upon receipt of this payment, Bespoke Financial will mark this
        payment as "settled" and apply it towards outstanding loans and fees
        accordingly.
      </>
    );
  } else if (payment.method === PaymentMethodEnum.ReverseDraftACH) {
    return (
      <>
        After you press "Schedule payment", Bespoke Financial will initiate a
        reverse draft ACH of <b>{formatCurrency(payment.requested_amount)}</b>{" "}
        from your bank account.
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
        After you press "Notify bank", Bespoke Financial will coordinate with
        you on the collection of{" "}
        <b>{formatCurrency(payment.requested_amount)}</b>. This method of
        payment will incur a $100 fee.
      </>
    );
  } else {
    return (
      <>
        After you press "Notify bank", Bespoke Financial will coordinate with
        you on the collection of a check of{" "}
        <b>{formatCurrency(payment.requested_amount)}</b>. Please make the check
        payable to Bespoke Financial.
      </>
    );
  }
}

function CreateRepaymentConfirmEffect({
  companyId,
  productType,
  payableAmountPrincipal,
  payableAmountInterest,
  loansBeforeAfterPayment,
  payment,
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
          <Box>
            <Box mb={2}>
              <Typography variant="body1">
                {`Payment Amount: ${formatCurrency(payment.requested_amount)}`}
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
          </Box>
        ) : (
          <>
            <Box>
              <Box mb={2}>
                <Typography variant="body1">
                  {`Payment Amount: ${formatCurrency(
                    payment.requested_amount
                  )}`}
                </Typography>
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
                  } payment to the following bank account:`}
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

export default CreateRepaymentConfirmEffect;
