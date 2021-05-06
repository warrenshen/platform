import SettleRepaymentModalAccountFees from "components/Repayment/SettleRepaymentModalAccountFees";
import SettleRepaymentModalLoans from "components/Repayment/SettleRepaymentModalLoans";
import {
  BankPayorFragment,
  Companies,
  Payments,
  PaymentsInsertInput,
  useGetPaymentForSettlementQuery,
} from "generated/graphql";
import { PaymentTypeEnum } from "lib/enum";
import { useState } from "react";

interface Props {
  paymentId: Payments["id"];
  handleClose: () => void;
}

export default function SettleRepaymentModal({
  paymentId,
  handleClose,
}: Props) {
  const [customer, setCustomer] = useState<Companies | null>(null);
  const [payor, setPayor] = useState<BankPayorFragment | null>(null);
  const [payment, setPayment] = useState<PaymentsInsertInput>({});

  useGetPaymentForSettlementQuery({
    fetchPolicy: "network-only",
    variables: {
      id: paymentId,
    },
    onCompleted: (data) => {
      const existingPayment = data?.payments_by_pk;
      if (existingPayment) {
        setCustomer(existingPayment.company as Companies);
        setPayor(
          (existingPayment.invoice?.payor ||
            existingPayment.company) as BankPayorFragment
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
          deposit_date: existingPayment.payment_date, // Default deposit_date to payment_date
          settlement_date:
            existingPayment.type === PaymentTypeEnum.RepaymentOfAccountFee
              ? existingPayment.payment_date
              : null,
          items_covered: {
            loan_ids: existingPayment.items_covered.loan_ids || [],
            requested_to_principal:
              existingPayment.items_covered.requested_to_principal,
            requested_to_interest:
              existingPayment.items_covered.requested_to_interest,
            // Default to_principal and to_interest to their requested counterparts.
            to_principal: existingPayment.items_covered.requested_to_principal,
            to_interest: existingPayment.items_covered.requested_to_interest,
            to_user_credit: 0.0,
            to_fees:
              existingPayment.type === PaymentTypeEnum.RepaymentOfAccountFee
                ? existingPayment.amount || existingPayment.requested_amount
                : 0.0,
          },
        } as PaymentsInsertInput);
      } else {
        alert("Existing payment not found");
      }
    },
  });

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
      customer={customer}
      payor={payor}
      payment={payment}
      setPayment={setPayment}
      handleClose={handleClose}
    />
  );
}
