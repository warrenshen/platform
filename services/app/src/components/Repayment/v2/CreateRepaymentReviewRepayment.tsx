import { Box, Divider } from "@material-ui/core";
import BankAccountInfoCardContent from "components/BankAccount/BankAccountInfoCardContent";
import BeforeAfterRepaymentDetails from "components/Repayment/v2/BeforeAfterRepaymentDetails";
import LoansBeforeAfterPaymentPreviewNew from "components/Repayment/v2/LoansBeforeAfterPaymentPreviewNew";
import PaymentDetailsRow from "components/Repayment/v2/PaymentDetailsRow";
import VerticalValueAndLabel from "components/Repayment/v2/VerticalValueAndLabel";
import FullWidthAlert from "components/Shared/Alert/FullWidthAlert";
import CardContainer from "components/Shared/Card/CardContainer";
import CardDivider from "components/Shared/Card/CardDivider";
import { SecondaryTextColor } from "components/Shared/Colors/GlobalColors";
import Text, { TextVariants } from "components/Shared/Text/Text";
import {
  Companies,
  PaymentsInsertInput,
  useBankAccountsForTransferQuery,
} from "generated/graphql";
import { ArrowRightIcon } from "icons";
import {
  ProductTypeEnum,
  RepaymentMethodEnum,
  RepaymentMethodToLabel,
} from "lib/enum";
import { LoanBeforeAfterPayment } from "lib/finance/payments/repayment";
import { formatCurrency } from "lib/number";

interface Props {
  companyId: Companies["id"];
  productType: ProductTypeEnum | null;
  payableAmountPrincipal: number;
  payableAmountInterest: number;
  payableAmountAccountFee: number;
  payment: PaymentsInsertInput;
  loansBeforeAfterPayment: LoanBeforeAfterPayment[];
  isPayAccountFeesChecked: boolean;
  showAddress?: boolean;
}

function getAlertText(payment: PaymentsInsertInput) {
  if (
    [RepaymentMethodEnum.ACH, RepaymentMethodEnum.Wire].includes(
      payment.method as RepaymentMethodEnum
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
  } else if (payment.method === RepaymentMethodEnum.ReverseDraftACH) {
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

export default function CreateRepaymentReviewRepayment({
  companyId,
  productType,
  payableAmountPrincipal,
  payableAmountInterest,
  payableAmountAccountFee,
  loansBeforeAfterPayment,
  payment,
  isPayAccountFeesChecked,
  showAddress = false,
}: Props) {
  const {
    requested_to_principal: requestedToPrincipal = 0,
    requested_to_interest: requestedToInterest = 0,
    requested_from_holding_account: requestedFromHoldingAccount = 0,
  } = payment.items_covered;

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
      <Text textVariant={TextVariants.ParagraphLead} bottomMargin={8}>
        Review repayment
      </Text>
      <Text textVariant={TextVariants.Paragraph} color={SecondaryTextColor}>
        Confirm repayment details are all correct.
      </Text>
      <PaymentDetailsRow
        depositDate={payment.settlement_date}
        repaymentMethod={payment.method as RepaymentMethodEnum}
        repaymentAmount={payment.requested_amount}
        amountFromHoldingAccount={requestedFromHoldingAccount}
      />
      <Box>
        <CardDivider />
        {productType === ProductTypeEnum.LineOfCredit ? (
          <BeforeAfterRepaymentDetails
            payableAmountPrincipal={payableAmountPrincipal}
            payableAmountInterest={payableAmountInterest}
            payableAmountAccountFee={payableAmountAccountFee}
            principalAmountCovered={requestedToPrincipal}
            interestAmountCovered={requestedToInterest}
            accountFeeAmountCovered={
              payment.items_covered?.requested_to_account_fees || 0
            }
          />
        ) : (
          <>
            <Box display="flex">
              <Text textVariant={TextVariants.ParagraphLead}>
                Before Repayment
              </Text>
              <Box mr={70} />
              <Text textVariant={TextVariants.ParagraphLead}>
                After Repayment
              </Text>
            </Box>
            <LoansBeforeAfterPaymentPreviewNew
              isSettlePayment={false}
              loansBeforeAfterPayment={loansBeforeAfterPayment}
            />
          </>
        )}
      </Box>
      <Box my={6}>
        <Divider light />
      </Box>
      {isPayAccountFeesChecked && (
        <Box display="flex" mb={5}>
          <VerticalValueAndLabel
            label="Account fees amount"
            value={formatCurrency(payableAmountAccountFee)}
          />
          <Box mt={3} ml={55.5} mr={13}>
            <ArrowRightIcon />
          </Box>
          <VerticalValueAndLabel
            label="Account fees amount"
            value={formatCurrency(
              payableAmountAccountFee -
                (payment.items_covered?.requested_to_account_fees || 0)
            )}
          />
        </Box>
      )}
      <Box>
        {payment.requested_amount <= 0 ? (
          <Box>No amount is currently due. No further action is required</Box>
        ) : (
          <Box>
            <Box mb={2}>
              <Text textVariant={TextVariants.ParagraphLead}>
                Important Instructions
              </Text>
            </Box>
            {[RepaymentMethodEnum.ACH, RepaymentMethodEnum.Wire].includes(
              payment.method as RepaymentMethodEnum
            ) && (
              <>
                <Text textVariant={TextVariants.Paragraph}>
                  {`Please send your ${
                    RepaymentMethodToLabel[
                      payment.method as RepaymentMethodEnum
                    ]
                  } repayment to the following bank account:`}
                </Text>
                <Box mt={2}>
                  {!!bespokeCollectionsBankAccount && (
                    <CardContainer>
                      <BankAccountInfoCardContent
                        bankAccount={bespokeCollectionsBankAccount}
                      />
                    </CardContainer>
                  )}
                </Box>
              </>
            )}

            <FullWidthAlert severity="info">
              <Text textVariant={TextVariants.Paragraph} bottomMargin={0}>
                {getAlertText(payment)}
              </Text>
            </FullWidthAlert>
          </Box>
        )}
      </Box>
    </Box>
  );
}
