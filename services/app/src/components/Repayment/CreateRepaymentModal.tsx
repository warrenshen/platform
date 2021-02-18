import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@material-ui/core";
import CreateRepaymentConfirmEffect from "components/Repayment/CreateRepaymentConfirmEffect";
import CreateRepaymentSelectLoans from "components/Repayment/CreateRepaymentSelectLoans";
import { PaymentTransferType } from "components/Shared/BankToBankTransfer";
import {
  Companies,
  LoanFragment,
  PaymentsInsertInput,
} from "generated/graphql";
import { PaymentMethodEnum } from "lib/enum";
import {
  calculateEffectOfPayment,
  createPayment,
  LoanBalance,
  LoanTransaction,
} from "lib/finance/payments/repayment";
import { LoanBeforeAfterPayment } from "lib/types";
import { useState } from "react";

interface Props {
  companyId: Companies["id"];
  selectedLoans: LoanFragment[];
  handleClose: () => void;
}

function RepaymentModal({ companyId, selectedLoans, handleClose }: Props) {
  // There are 2 states that we show, one when the user is selecting
  // the payment method date, and payment type, and the next is when
  // they have to "confirm" what they have selected.
  const [isOnSelectLoans, setIsOnSelectLoans] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const [loansBeforeAfterPayment, setLoansBeforeAfterPayment] = useState<
    LoanBeforeAfterPayment[]
  >([]);

  const [payment, setPayment] = useState<PaymentsInsertInput>({
    company_id: companyId,
    type: PaymentTransferType.ToBank,
    amount: 0.0,
    method: PaymentMethodEnum.None,
    payment_date: null,
  });

  // A payment option is the user's choice to payment the remaining balances on the loan, to
  // pay the minimum amount required, or to pay a custom amount.
  const [paymentOption, setPaymentOption] = useState("");

  const isPaymentMethodSet =
    payment.method && payment.method !== PaymentMethodEnum.None;

  const isNextButtonEnabled =
    payment.payment_date && isPaymentMethodSet && paymentOption !== "";
  const isActionButtonEnabled = isPaymentMethodSet && payment.amount > 0;
  const actionBtnText =
    payment.method === PaymentMethodEnum.ReverseDraftACH
      ? "Schedule"
      : "Notify";

  const selectedLoanIds = selectedLoans.map((selectedLoan) => selectedLoan.id);

  const handleClickNext = async () => {
    if (payment.amount && payment.amount.length > 0) {
      payment.amount = parseFloat(payment.amount);
    }

    const resp = await calculateEffectOfPayment({
      payment: payment,
      company_id: companyId,
      payment_option: paymentOption,
      loan_ids: selectedLoanIds,
    });

    if (resp.status !== "OK") {
      setErrMsg(resp.msg || "");
    } else {
      setErrMsg("");
      setPayment({ ...payment, amount: resp.amount_to_pay || 0 });

      if (!resp.loans_afterwards) {
        alert("Developer error: response does not include loans_afterwards.");
        return;
      }

      setLoansBeforeAfterPayment(
        resp.loans_afterwards.map((loan_afterwards) => {
          const beforeLoan = selectedLoans.find(
            (selectedLoan) => selectedLoan.id === loan_afterwards.loan_id
          );
          return {
            loan_id: beforeLoan?.id,
            loan_balance_before: {
              outstanding_principal_balance:
                beforeLoan?.outstanding_principal_balance,
              outstanding_interest: beforeLoan?.outstanding_interest,
              outstanding_fees: beforeLoan?.outstanding_fees,
            } as LoanBalance,
            loan_balance_after: {
              outstanding_principal_balance:
                loan_afterwards.loan_balance.outstanding_principal_balance,
              outstanding_interest:
                loan_afterwards.loan_balance.outstanding_interest,
              outstanding_fees: loan_afterwards.loan_balance.outstanding_fees,
              transaction: loan_afterwards.transaction as LoanTransaction,
            } as LoanBalance,
          } as LoanBeforeAfterPayment;
        })
      );

      setIsOnSelectLoans(false);
    }
  };

  const handleClickConfirm = async () => {
    if (payment.amount !== null && payment.amount !== undefined) {
      payment.amount = parseFloat(payment.amount);
    } else {
      setErrMsg("Payment amount must be larger than 0");
      return;
    }

    const resp = await createPayment({
      payment: payment,
      company_id: companyId,
      loan_ids: selectedLoanIds,
    });

    if (resp.status !== "OK") {
      setErrMsg(resp.msg);
    } else {
      setErrMsg("");
      handleClose();
    }
  };

  return (
    <Dialog open fullWidth maxWidth="md" onClose={handleClose}>
      <DialogTitle>Pay Off Loan(s)</DialogTitle>
      <DialogContent style={{ minHeight: 400 }}>
        {isOnSelectLoans ? (
          <CreateRepaymentSelectLoans
            selectedLoans={selectedLoans}
            payment={payment}
            paymentOption={paymentOption}
            setPayment={setPayment}
            setPaymentOption={setPaymentOption}
          />
        ) : (
          <>
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
            <CreateRepaymentConfirmEffect
              loansBeforeAfterPayment={loansBeforeAfterPayment}
              payment={payment}
              setPayment={setPayment}
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Box display="flex">
          {errMsg && <span style={{ float: "left" }}>{errMsg}</span>}
          <Box pr={1}>
            <Button onClick={handleClose}>Cancel</Button>
            {isOnSelectLoans ? (
              <Button
                disabled={!isNextButtonEnabled}
                variant="contained"
                color="primary"
                onClick={handleClickNext}
              >
                Next
              </Button>
            ) : (
              <Button
                disabled={!isActionButtonEnabled}
                variant="contained"
                color="primary"
                onClick={handleClickConfirm}
              >
                {actionBtnText}
              </Button>
            )}
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default RepaymentModal;
