import SettleRepaymentModalAccountFees from "components/Repayment/SettleRepaymentModalAccountFees";
import SettleRepaymentModalLoans from "components/Repayment/SettleRepaymentModalLoans";
import {
  PayorFragment,
  Companies,
  Payments,
  PaymentsInsertInput,
  useGetPaymentForSettlementQuery,
} from "generated/graphql";
import { addBizDays, todayAsDateStringServer } from "lib/date";
import {
  RepaymentMethodEnum,
  PaymentTypeEnum,
  PaymentOptionEnum,
} from "lib/enum";
import { useEffect, useState } from "react";

interface Props {
  paymentId: Payments["id"];
  handleClose: () => void;
}

export default function SettleRepaymentModal({
  paymentId,
  handleClose,
}: Props) {
  const [customer, setCustomer] = useState<Companies | null>(null);
  const [payor, setPayor] = useState<PayorFragment | null>(null);
  const [payment, setPayment] = useState<PaymentsInsertInput>({});

  // Whether "Apply payment to account fees?" is checked.
  const [
    isAmountToAccountFeesChecked,
    setIsAmountToAccountFeesChecked,
  ] = useState(false);
  // Whether "Apply payment to loans?" is checked.
  const [isAmountToLoansChecked, setIsAmountToLoansChecked] = useState(false);

  useGetPaymentForSettlementQuery({
    fetchPolicy: "network-only",
    variables: {
      id: paymentId,
      today: todayAsDateStringServer(),
    },
    onCompleted: (data) => {
      const existingPayment = data?.payments_by_pk;
      if (existingPayment) {
        setCustomer(existingPayment.company as Companies);
        setPayor(
          (existingPayment.invoice?.payor ||
            existingPayment.company) as PayorFragment
        );
        const initialDepositDate = addBizDays(
          existingPayment.payment_date,
          existingPayment.method === RepaymentMethodEnum.ReverseDraftACH ? 1 : 0
        );
        setPayment({
          id: existingPayment.id,
          company_id: existingPayment.company_id,
          type: existingPayment.type,
          method: existingPayment.method,
          requested_amount: existingPayment.requested_amount,
          // For Reverse Draft ACH method, amount will have a value.
          // For other methods, amount will not have a value so we use requested_amount.
          amount: existingPayment.amount || existingPayment.requested_amount,
          requested_payment_date: existingPayment.requested_payment_date,
          payment_date: existingPayment.payment_date,
          // Default deposit_date to payment_date.
          deposit_date: initialDepositDate,
          settlement_date:
            existingPayment.type === PaymentTypeEnum.RepaymentOfAccountFee
              ? initialDepositDate
              : null,
          items_covered: {
            loan_ids: existingPayment.items_covered.loan_ids || [],
            payment_option:
              existingPayment.items_covered.payment_option ||
              PaymentOptionEnum.Unknown,
            requested_to_principal:
              existingPayment.items_covered.requested_to_principal,
            requested_to_interest:
              existingPayment.items_covered.requested_to_interest,
            requested_to_account_fees:
              existingPayment.items_covered.requested_to_account_fees,
            // Default to_principal, to_interest, and to_account_fees to their requested counterparts.
            to_principal: existingPayment.items_covered.requested_to_principal,
            to_interest: existingPayment.items_covered.requested_to_interest,
            // Default to_account_fees to 0.0 for backwards compatibility.
            to_account_fees:
              existingPayment.items_covered.requested_to_account_fees || 0.0,
            to_user_credit: 0.0,
          },
        } as PaymentsInsertInput);
        // Initialize starting value for "Apply portion of repayment to account-level fees?".
        if (!!existingPayment.items_covered.requested_to_account_fees) {
          setIsAmountToAccountFeesChecked(true);
        }
        // Initialize starting value for "Apply portion of repayment to loan(s)?".
        if (!!existingPayment.items_covered.loan_ids) {
          setIsAmountToLoansChecked(true);
        }
      } else {
        alert("Existing payment not found");
      }
    },
  });

  useEffect(() => {
    if (
      !isAmountToLoansChecked &&
      !!payment.items_covered?.loan_ids &&
      payment.items_covered.loan_ids.length > 0
    ) {
      // If "Apply portion of repayment to loan(s)" is not checked,
      // ensure that no loans are selected in payment.items_covered.
      setPayment((payment) => ({
        ...payment,
        items_covered: {
          ...payment.items_covered,
          loan_ids: [],
        },
      }));
    }
  }, [
    isAmountToLoansChecked,
    payment.items_covered?.loan_ids,
    setIsAmountToLoansChecked,
    setPayment,
  ]);

  if (!payment || !customer || !payor) {
    return null;
  }

  const isRepaymentForAccountFees =
    payment?.type === PaymentTypeEnum.RepaymentOfAccountFee;

  return isRepaymentForAccountFees ? (
    <SettleRepaymentModalAccountFees
      customer={customer}
      payor={payor}
      payment={payment}
      setPayment={setPayment}
      handleClose={handleClose}
    />
  ) : (
    <SettleRepaymentModalLoans
      isAmountToAccountFeesChecked={isAmountToAccountFeesChecked}
      isAmountToLoansChecked={isAmountToLoansChecked}
      customer={customer}
      payor={payor}
      payment={payment}
      setIsAmountToAccountFeesChecked={setIsAmountToAccountFeesChecked}
      setIsAmountToLoansChecked={setIsAmountToLoansChecked}
      setPayment={setPayment}
      handleClose={handleClose}
    />
  );
}
