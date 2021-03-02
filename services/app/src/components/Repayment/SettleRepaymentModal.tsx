import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@material-ui/core";
import SettleRepaymentConfirmEffect from "components/Repayment/SettleRepaymentConfirmEffect";
import SettleRepaymentSelectLoans from "components/Repayment/SettleRepaymentSelectLoans";
import {
  Companies,
  GetLoansByLoanIdsQuery,
  Loans,
  Payments,
  PaymentsInsertInput,
  useGetLoansByLoanIdsQuery,
  useGetPaymentForSettlementQuery,
} from "generated/graphql";
import { PaymentOptionEnum } from "lib/enum";
import {
  calculateEffectOfPayment,
  LoanBalance,
  LoanTransaction,
  settlePayment,
} from "lib/finance/payments/repayment";
import { LoanBeforeAfterPayment } from "lib/types";
import { useEffect, useState } from "react";

interface Props {
  paymentId: Payments["id"];
  handleClose: () => void;
}

function SettleRepaymentModal({ paymentId, handleClose }: Props) {
  // There are 2 states that we show, one when the user is selecting
  // the payment method date, and payment type, and the next is when
  // they have to "confirm" what they have selected.
  const [isOnSelectLoans, setIsOnSelectLoans] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const [loansBeforeAfterPayment, setLoansBeforeAfterPayment] = useState<
    LoanBeforeAfterPayment[]
  >([]);

  const [selectedLoans, setSelectedLoans] = useState<
    GetLoansByLoanIdsQuery["loans"]
  >([]);
  const [selectedLoanIds, setSelectedLoanIds] = useState<Loans["id"][]>([]);

  const [customer, setCustomer] = useState<Companies | null>(null);
  const [payment, setPayment] = useState<PaymentsInsertInput | null>(null);

  useGetPaymentForSettlementQuery({
    variables: {
      id: paymentId,
    },
    onCompleted: (data) => {
      const existingPayment = data?.payments_by_pk;
      if (existingPayment) {
        setSelectedLoanIds(existingPayment.items_covered?.loan_ids || []);
        setCustomer(existingPayment.company as Companies);
        setPayment({
          id: existingPayment.id,
          company_id: existingPayment.company_id,
          type: existingPayment.type,
          amount: existingPayment.amount,
          method: existingPayment.method,
          requested_payment_date: existingPayment.requested_payment_date,
          payment_date: existingPayment.requested_payment_date,
          settlement_date: existingPayment.settlement_date,
        } as PaymentsInsertInput);
      } else {
        alert("Existing payment not found");
      }
    },
  });

  const { data: dataSelectedLoans } = useGetLoansByLoanIdsQuery({
    variables: {
      loanIds: selectedLoanIds,
    },
  });

  useEffect(() => {
    if (dataSelectedLoans) {
      const selectedLoans = dataSelectedLoans.loans || [];
      setSelectedLoans(selectedLoans);
    }
  }, [dataSelectedLoans]);

  const handleClickNext = async () => {
    if (!payment || !customer) {
      alert("Developer error: payment or customer does not exist.");
      return;
    }

    const response = await calculateEffectOfPayment({
      payment: {
        amount: payment.amount,
        payment_date: payment.payment_date,
        settlement_date: payment.settlement_date,
      } as PaymentsInsertInput,
      company_id: customer.id,
      payment_option: PaymentOptionEnum.CustomAmount,
      loan_ids: selectedLoanIds,
    });

    console.log({ type: "calculateEffectOfPayment", response });

    if (response.status !== "OK") {
      setErrMsg(response.msg || "");
    } else {
      setErrMsg("");

      if (!response.loans_to_show) {
        alert("Developer error: response does not include loans_afterwards.");
        return;
      }

      setLoansBeforeAfterPayment(
        response.loans_to_show.map((loanToShow) => {
          const beforeLoan = loanToShow.before_loan_balance;
          const afterLoan = loanToShow.after_loan_balance;

          return {
            loan_id: loanToShow.loan_id,
            loan_balance_before: {
              outstanding_principal_balance:
                beforeLoan?.outstanding_principal_balance,
              outstanding_interest: beforeLoan?.outstanding_interest,
              outstanding_fees: beforeLoan?.outstanding_fees,
            } as LoanBalance,
            loan_balance_after: {
              outstanding_principal_balance:
                afterLoan.outstanding_principal_balance,
              outstanding_interest: afterLoan.outstanding_interest,
              outstanding_fees: afterLoan.outstanding_fees,
            } as LoanBalance,
            transaction: loanToShow.transaction as LoanTransaction,
          } as LoanBeforeAfterPayment;
        })
      );

      setIsOnSelectLoans(false);
    }
  };

  const handleClickConfirm = async () => {
    if (!payment || !customer) {
      alert("Developer error: payment or customer does not exist.");
      return;
    }

    const response = await settlePayment({
      payment_id: payment.id,
      company_id: customer.id,
      loan_ids: selectedLoanIds,
      transaction_inputs: loansBeforeAfterPayment.map(
        (beforeAfterPaymentLoan) => beforeAfterPaymentLoan.transaction
      ),
      payment_date: payment.payment_date,
      settlement_date: payment.settlement_date,
    });

    if (response.status !== "OK") {
      setErrMsg(response.msg || "Error!");
    } else {
      setErrMsg("");
      handleClose();
    }
  };

  return payment && customer ? (
    <Dialog open fullWidth maxWidth="md" onClose={handleClose}>
      <DialogTitle>Settle Payment</DialogTitle>
      <DialogContent>
        {isOnSelectLoans ? (
          <SettleRepaymentSelectLoans
            payment={payment}
            customer={customer}
            selectedLoanIds={selectedLoanIds}
            selectedLoans={selectedLoans}
            setPayment={setPayment}
            setSelectedLoanIds={setSelectedLoanIds}
          />
        ) : (
          <SettleRepaymentConfirmEffect
            loansBeforeAfterPayment={loansBeforeAfterPayment}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Box display="flex" flexDirection="column" width="100%">
          {errMsg && (
            <Box display="flex" justifyContent="flex-end" width="100%">
              <Typography variant="body1" color="secondary">
                {errMsg}
              </Typography>
            </Box>
          )}
          <Box display="flex" justifyContent="space-between">
            {!isOnSelectLoans && (
              <Box mb={2}>
                <Button
                  variant="contained"
                  color="default"
                  onClick={() => setIsOnSelectLoans(true)}
                >
                  Back to Step 1
                </Button>
              </Box>
            )}
            <Box display="flex" justifyContent="flex-end">
              <Button onClick={handleClose}>Cancel</Button>
              {isOnSelectLoans ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleClickNext}
                >
                  Next
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleClickConfirm}
                >
                  Confirm
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  ) : null;
}

export default SettleRepaymentModal;
