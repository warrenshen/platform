import {
  Box,
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import ScheduleRepaymentConfirmEffect from "components/Repayment/ScheduleRepaymentConfirmEffect";
import ScheduleRepaymentSelectLoans from "components/Repayment/ScheduleRepaymentSelectLoans";
import {
  Companies,
  GetLoansByLoanIdsQuery,
  Payments,
  PaymentsInsertInput,
  ProductTypeEnum,
  useGetLoansByLoanIdsQuery,
  useGetPaymentForSettlementQuery,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { PaymentOptionEnum } from "lib/enum";
import {
  computeSettlementDateForPayment,
  getSettlementTimelineConfigFromContract,
} from "lib/finance/payments/advance";
import {
  calculateRepaymentEffect,
  CalculateRepaymentEffectResp,
  LoanBalance,
  LoanTransaction,
  scheduleRepaymentMutation,
} from "lib/finance/payments/repayment";
import { LoanBeforeAfterPayment } from "lib/types";
import { useEffect, useState } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialog: {
      width: 600,
    },
    dialogTitle: {
      borderBottom: "1px solid #c7c7c7",
    },
    dialogActions: {
      margin: theme.spacing(2),
    },
    submitButton: {
      marginLeft: theme.spacing(1),
    },
  })
);

interface Props {
  paymentId: Payments["id"];
  handleClose: () => void;
}

function ScheduleRepaymentModal({ paymentId, handleClose }: Props) {
  const classes = useStyles();
  const snackbar = useSnackbar();

  // There are 2 states that we show, one when the user is selecting
  // the payment method date, and payment type, and the next is when
  // they have to "confirm" what they have selected.
  const [isOnSelectLoans, setIsOnSelectLoans] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const [customer, setCustomer] = useState<Companies | null>(null);
  const [payment, setPayment] = useState<PaymentsInsertInput | null>(null);

  const [selectedLoans, setSelectedLoans] = useState<
    GetLoansByLoanIdsQuery["loans"]
  >([]);

  const contract = customer?.contract || null;
  const productType = customer?.contract?.product_type || null;

  const [
    calculateEffectResponse,
    setCalculateEffectResponse,
  ] = useState<CalculateRepaymentEffectResp | null>(null);
  const [loansBeforeAfterPayment, setLoansBeforeAfterPayment] = useState<
    LoanBeforeAfterPayment[]
  >([]);

  useGetPaymentForSettlementQuery({
    variables: {
      id: paymentId,
    },
    onCompleted: (data) => {
      const existingPayment = data?.payments_by_pk;
      if (existingPayment) {
        setCustomer(existingPayment.company as Companies);
        setPayment({
          id: existingPayment.id,
          company_id: existingPayment.company_id,
          type: existingPayment.type,
          method: existingPayment.method,
          requested_amount: existingPayment.requested_amount,
          amount: existingPayment.requested_amount,
          requested_payment_date: existingPayment.requested_payment_date,
          payment_date: existingPayment.requested_payment_date, // Default payment_date to requested_payment_date
          items_covered: {
            loan_ids: existingPayment.items_covered.loan_ids,
            requested_to_principal:
              existingPayment.items_covered.requested_to_principal,
            requested_to_interest:
              existingPayment.items_covered.requested_to_interest,
            // Default to_principal and to_interest to their requested counterparts.
            to_principal: existingPayment.items_covered.requested_to_principal,
            to_interest: existingPayment.items_covered.requested_to_interest,
          },
        } as PaymentsInsertInput);
      } else {
        alert("Existing payment not found");
      }
    },
  });

  useEffect(() => {
    if (contract && payment?.method && payment?.payment_date) {
      const settlementTimelineConfig = getSettlementTimelineConfigFromContract(
        contract
      );
      const settlementDate = computeSettlementDateForPayment(
        payment.method || null,
        payment.payment_date,
        settlementTimelineConfig
      );
      setPayment((payment) => ({
        ...payment,
        deposit_date: settlementDate,
        settlement_date: settlementDate,
      }));
    }
  }, [contract, payment?.method, payment?.payment_date, setPayment]);

  const { data: selectedLoansData } = useGetLoansByLoanIdsQuery({
    skip: !payment?.items_covered?.loan_ids,
    variables: {
      loanIds: payment?.items_covered?.loan_ids || [],
    },
  });

  useEffect(() => {
    if (selectedLoansData) {
      const selectedLoans = selectedLoansData.loans || [];
      setSelectedLoans(selectedLoans);
    }
  }, [selectedLoansData]);

  const [
    scheduleRepayment,
    { loading: isScheduleRepaymentLoading },
  ] = useCustomMutation(scheduleRepaymentMutation);

  const handleClickNext = async () => {
    if (!payment || !customer) {
      alert("Developer error: payment or customer does not exist.");
      return;
    }

    const response = await calculateRepaymentEffect({
      company_id: customer.id,
      payment_option: PaymentOptionEnum.CustomAmount,
      amount: payment.amount,
      settlement_date: payment.settlement_date,
      loan_ids: selectedLoans.map((selectedLoan) => selectedLoan.id),
    });

    console.log({ type: "calculateRepaymentEffect", response });

    if (response.status !== "OK") {
      setErrMsg(response.msg || "");
    } else {
      setErrMsg("");

      if (!response.loans_to_show) {
        alert("Developer error: response does not include loans_to_show.");
        return;
      }

      setCalculateEffectResponse(response);
      setPayment({
        ...payment,
        requested_amount: response.amount_to_pay || null,
        items_covered: {
          ...payment.items_covered,
          loan_ids: response.loans_to_show.map(
            (loanToShow) => loanToShow.loan_id
          ),
        },
      });
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
    if (!payment || !customer) {
      alert("Developer error: payment or customer does not exist.");
      return;
    }

    if (payment.requested_amount <= 0) {
      setErrMsg("Payment amount must be larger than 0");
      return;
    }

    const response = await scheduleRepayment({
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
      snackbar.showSuccess("Success! Payment scheduled.");
      handleClose();
    }
  };

  if (!payment || !customer) {
    return null;
  }

  const isNextButtonDisabled =
    !payment.method || !payment.payment_date || !payment.deposit_date;
  const isActionButtonDisabled =
    isNextButtonDisabled || isScheduleRepaymentLoading || payment.amount <= 0;

  return (
    <Dialog open fullWidth maxWidth="md" onClose={handleClose}>
      <DialogTitle className={classes.dialogTitle}>
        Schedule Reverse Draft ACH Payment
      </DialogTitle>
      <DialogContent style={{ minHeight: 400 }}>
        {isOnSelectLoans ? (
          <ScheduleRepaymentSelectLoans
            payment={payment}
            customer={customer}
            selectedLoans={selectedLoans}
            setPayment={setPayment}
          />
        ) : (
          <ScheduleRepaymentConfirmEffect
            productType={productType}
            payableAmountPrincipal={
              calculateEffectResponse?.payable_amount_principal || 0
            }
            payableAmountInterest={
              calculateEffectResponse?.payable_amount_interest || 0
            }
            payment={payment}
            customer={customer}
            loansBeforeAfterPayment={loansBeforeAfterPayment}
            setPayment={setPayment}
          />
        )}
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Box display="flex" flexDirection="column" width="100%">
          {errMsg && (
            <Box display="flex" justifyContent="flex-end" width="100%">
              <Typography variant="body1" color="secondary">
                {errMsg}
              </Typography>
            </Box>
          )}
          <Box display="flex" justifyContent="space-between">
            <Box>
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
                  disabled={isNextButtonDisabled}
                  variant="contained"
                  color="primary"
                  onClick={handleClickNext}
                >
                  Next
                </Button>
              ) : (
                <Button
                  disabled={isActionButtonDisabled}
                  variant="contained"
                  color="primary"
                  onClick={handleClickConfirm}
                >
                  Schedule
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default ScheduleRepaymentModal;
