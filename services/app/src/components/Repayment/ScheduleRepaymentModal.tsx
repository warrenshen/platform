import { Box, Typography } from "@material-ui/core";
import ScheduleRepaymentSelectLoans from "components/Repayment/ScheduleRepaymentSelectLoans";
import Modal from "components/Shared/Modal/Modal";
import {
  BankAccounts,
  Companies,
  Payments,
  PaymentsInsertInput,
  useGetPaymentForSettlementQuery,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { scheduleAccountLevelFeeRepaymentMutation } from "lib/api/payments";
import { addBizDays, subtractBizDays, todayAsDateStringServer } from "lib/date";
import { PaymentTypeEnum, PaymentOptionEnum, ProductTypeEnum } from "lib/enum";
import {
  computeSettlementDateForPayment,
  getSettlementTimelineConfigFromContract,
} from "lib/finance/payments/advance";
import { scheduleRepaymentMutation } from "lib/finance/payments/repayment";
import { useEffect, useState } from "react";

interface Props {
  paymentId: Payments["id"];
  handleClose: () => void;
}

export default function ScheduleRepaymentModal({
  paymentId,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();

  const [errMsg, setErrMsg] = useState("");

  const [customer, setCustomer] = useState<Companies | null>(null);
  const [payment, setPayment] = useState<PaymentsInsertInput | null>(null);
  const [
    customerBankAccount,
    setCustomerBankAccount,
  ] = useState<BankAccounts | null>(null);

  const contract = customer?.contract || null;
  const productType = customer?.contract?.product_type || null;

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
        setCustomerBankAccount(
          existingPayment.company_bank_account as BankAccounts
        );
        setPayment({
          id: existingPayment.id,
          company_id: existingPayment.company_id,
          type: existingPayment.type,
          method: existingPayment.method,
          requested_amount: existingPayment.requested_amount,
          amount: existingPayment.requested_amount,
          // requested_payment_date: the date customer requests payment to LEAVE their bank account.
          requested_payment_date: existingPayment.requested_payment_date,
          // payment_date: the date payment is submitted to bank. Default payment_date is requested_payment_date - 1 day.
          payment_date: existingPayment.requested_payment_date
            ? subtractBizDays(existingPayment.requested_payment_date, 1)
            : null,
          items_covered: {
            loan_ids: existingPayment.items_covered.loan_ids,
            requested_to_principal:
              existingPayment.items_covered.requested_to_principal,
            requested_to_interest:
              existingPayment.items_covered.requested_to_interest,
            requested_to_account_fees:
              existingPayment.items_covered.requested_to_account_fees,
            payment_option:
              existingPayment.items_covered.payment_option ||
              PaymentOptionEnum.Unknown,
          },
        } as PaymentsInsertInput);
      } else {
        snackbar.showError("Payment not found.");
      }
    },
  });

  useEffect(() => {
    if (contract && payment?.method && payment?.payment_date) {
      // For Reverse Draft ACH repayment method, deposit date equals payment date + 1 day.
      // Why? Banks execute the payment the day after you submit it to them.
      const depositDate = addBizDays(payment.payment_date, 1);
      const settlementTimelineConfig = getSettlementTimelineConfigFromContract(
        contract
      );
      const settlementDate = computeSettlementDateForPayment(
        payment.method,
        depositDate,
        settlementTimelineConfig
      );
      setPayment((payment) => ({
        ...payment,
        deposit_date: depositDate,
        settlement_date: settlementDate,
      }));
    }
  }, [contract, payment?.method, payment?.payment_date, setPayment]);

  const [
    scheduleRepayment,
    { loading: isScheduleRepaymentLoading },
  ] = useCustomMutation(scheduleRepaymentMutation);

  const [
    scheduleAccountLevelFeeRepayment,
    { loading: isScheduleAccountLevelFeeRepaymentLoading },
  ] = useCustomMutation(scheduleAccountLevelFeeRepaymentMutation);

  const handleClickConfirm = async () => {
    if (!payment || !customer) {
      alert("Developer error: payment or customer does not exist.");
      return;
    }

    if (payment.amount <= 0) {
      setErrMsg("Payment amount must be larger than 0");
      return;
    }

    const fn =
      payment.type === PaymentTypeEnum.RepaymentOfAccountFee
        ? scheduleAccountLevelFeeRepayment
        : scheduleRepayment;

    const response = await fn({
      variables: {
        company_id: customer.id,
        payment_id: paymentId,
        amount: payment.amount,
        payment_date: payment.payment_date,
        items_covered: payment.items_covered,
        is_line_of_credit: productType === ProductTypeEnum.LineOfCredit,
      },
    });

    if (response.status !== "OK") {
      setErrMsg(response.msg);
    } else {
      setErrMsg("");
      snackbar.showSuccess("Payment submitted.");
      handleClose();
    }
  };

  if (!payment || !customer) {
    return null;
  }

  const isNextButtonDisabled =
    !payment.method || !payment.payment_date || !payment.deposit_date;
  const isSubmitButtonDisabled =
    isNextButtonDisabled ||
    isScheduleRepaymentLoading ||
    isScheduleAccountLevelFeeRepaymentLoading ||
    payment.amount <= 0;

  return (
    <Modal
      isPrimaryActionDisabled={isSubmitButtonDisabled}
      title={"Submit Reverse Draft ACH Payment"}
      contentWidth={800}
      primaryActionText={"Submit"}
      handleClose={handleClose}
      handlePrimaryAction={handleClickConfirm}
    >
      <ScheduleRepaymentSelectLoans
        payment={payment}
        customer={customer}
        customerBankAccount={customerBankAccount}
        setPayment={setPayment}
      />
      {errMsg && (
        <Box display="flex" width="100%" mt={2}>
          <Typography variant="body1" color="secondary">
            {errMsg}
          </Typography>
        </Box>
      )}
    </Modal>
  );
}
