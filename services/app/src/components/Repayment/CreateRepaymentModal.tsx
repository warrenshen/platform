import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@material-ui/core";
import CreateRepaymentConfirmEffect from "components/Repayment/CreateRepaymentConfirmEffect";
import CreateRepaymentSelectLoans from "components/Repayment/CreateRepaymentSelectLoans";
import { PaymentTransferType } from "components/Shared/BankToBankTransfer";
import {
  Companies,
  LoanFragment,
  PaymentsInsertInput,
  useCompanyWithDetailsByCompanyIdQuery,
} from "generated/graphql";
import { PaymentMethodEnum } from "lib/enum";
import {
  computeSettlementDateForPayment,
  getSettlementTimelineConfigFromContract,
} from "lib/finance/payments/advance";
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

function CreateRepaymentModal({
  companyId,
  selectedLoans,
  handleClose,
}: Props) {
  const { data } = useCompanyWithDetailsByCompanyIdQuery({
    variables: {
      companyId: companyId,
    },
  });

  const company = data?.companies_by_pk;
  const contract = company?.contract || null;

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

  const settlementTimelineConfig = getSettlementTimelineConfigFromContract(
    contract
  );
  const settlementDate = computeSettlementDateForPayment(
    payment.method,
    payment.payment_date,
    settlementTimelineConfig
  );

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

    const response = await calculateEffectOfPayment({
      payment: { ...payment, settlement_date: settlementDate },
      company_id: companyId,
      payment_option: paymentOption,
      loan_ids: selectedLoanIds,
    });

    console.log({ type: "calculateEffectOfPayment", response });

    if (response.status !== "OK") {
      setErrMsg(response.msg || "");
    } else {
      setErrMsg("");
      setPayment({ ...payment, amount: response.amount_to_pay || 0 });

      if (!response.loans_to_show) {
        alert("Developer error: response does not include loans_to_show.");
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
              transaction: loanToShow.transaction as LoanTransaction,
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

    const response = await createPayment({
      payment: { ...payment, settlement_date: settlementDate },
      company_id: companyId,
      loan_ids: selectedLoanIds,
    });

    if (response.status !== "OK") {
      setErrMsg(response.msg);
    } else {
      setErrMsg("");
      handleClose();
    }
  };

  return (
    <Dialog open fullWidth maxWidth="md" onClose={handleClose}>
      <DialogTitle>Pay Off Loans</DialogTitle>
      <DialogContent style={{ minHeight: 400 }}>
        {isOnSelectLoans ? (
          <CreateRepaymentSelectLoans
            selectedLoans={selectedLoans}
            payment={payment}
            paymentOption={paymentOption}
            setPayment={setPayment}
            setPaymentOption={setPaymentOption}
            settlementDate={settlementDate}
          />
        ) : (
          <CreateRepaymentConfirmEffect
            loansBeforeAfterPayment={loansBeforeAfterPayment}
            payment={payment}
            setPayment={setPayment}
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
            <Box mb={2}>
              {!isOnSelectLoans && (
                <Button
                  variant="contained"
                  color="default"
                  onClick={() => setIsOnSelectLoans(true)}
                >
                  Back to Step 1
                </Button>
              )}
            </Box>

            <Box>
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
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default CreateRepaymentModal;
