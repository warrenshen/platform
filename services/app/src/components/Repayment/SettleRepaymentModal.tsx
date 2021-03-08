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
import SettleRepaymentConfirmEffect from "components/Repayment/SettleRepaymentConfirmEffect";
import SettleRepaymentSelectLoans from "components/Repayment/SettleRepaymentSelectLoans";
import {
  Companies,
  Contracts,
  GetLoansByLoanIdsQuery,
  Loans,
  Payments,
  PaymentsInsertInput,
  useGetLoansByLoanIdsQuery,
  useGetPaymentForSettlementQuery,
} from "generated/graphql";
import useSnackbar from "hooks/useSnackbar";
import { PaymentOptionEnum } from "lib/enum";
import {
  computeSettlementDateForPayment,
  getSettlementTimelineConfigFromContract,
} from "lib/finance/payments/advance";
import {
  calculateEffectOfPayment,
  LoanBalance,
  LoanTransaction,
  settlePayment,
} from "lib/finance/payments/repayment";
import { LoanBeforeAfterPayment } from "lib/types";
import { useEffect, useMemo, useState } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialog: {
      width: 500,
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

function SettleRepaymentModal({ paymentId, handleClose }: Props) {
  const classes = useStyles();
  const snackbar = useSnackbar();

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
        } as PaymentsInsertInput);
      } else {
        alert("Existing payment not found");
      }
    },
  });

  useEffect(() => {
    if (customer && payment?.method && payment?.payment_date) {
      const settlementTimelineConfig = getSettlementTimelineConfigFromContract(
        customer.contract as Contracts
      );
      const settlementDate = computeSettlementDateForPayment(
        payment.method,
        payment.payment_date,
        settlementTimelineConfig
      );
      setPayment((payment) => ({
        ...payment,
        settlement_date: settlementDate,
      }));
    }
  }, [customer, payment?.method, payment?.payment_date, setPayment]);

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
      company_id: customer.id,
      payment: {
        amount: payment.amount,
        payment_date: payment.payment_date,
        settlement_date: payment.settlement_date,
      } as PaymentsInsertInput,
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
      amount: payment.amount,
      payment_date: payment.payment_date,
      settlement_date: payment.settlement_date,
      loan_ids: selectedLoanIds,
      transaction_inputs: loansBeforeAfterPayment.map(
        (beforeAfterPaymentLoan) => beforeAfterPaymentLoan.transaction
      ),
    });

    if (response.status !== "OK") {
      setErrMsg(response.msg || "Error!");
    } else {
      setErrMsg("");
      snackbar.showSuccess("Success! Payment settled.");
      handleClose();
    }
  };

  const setLoanBeforeAfterPayment = useMemo(
    () => (loanId: Loans["id"], field: string, value: number) => {
      const newLoansBeforeAfterPayment = [...loansBeforeAfterPayment];
      const loanBeforeAfterPayment = newLoansBeforeAfterPayment.find(
        (loanBeforeAfterPayment) => loanBeforeAfterPayment.loan_id === loanId
      );
      if (!loanBeforeAfterPayment) {
        console.log("Developer error! Could not find loanBeforeAfterPayment.");
      } else {
        if (!["to_principal", "to_interest", "to_fees"].includes(field)) {
          console.log("Developer error! Invalid field given.");
        } else {
          const {
            loan_balance_before: loanBalanceBefore,
            loan_balance_after: loanBalanceAfter,
            transaction,
          } = loanBeforeAfterPayment;
          transaction[
            field as "to_principal" | "to_interest" | "to_fees"
          ] = value;
          transaction.amount =
            transaction.to_principal +
            transaction.to_interest +
            transaction.to_fees;
          loanBalanceAfter.outstanding_principal_balance =
            loanBalanceBefore.outstanding_principal_balance -
            transaction.to_principal;
          loanBalanceAfter.outstanding_interest =
            loanBalanceBefore.outstanding_interest - transaction.to_interest;
          loanBalanceAfter.outstanding_fees =
            loanBalanceBefore.outstanding_fees - transaction.to_fees;
          setLoansBeforeAfterPayment(newLoansBeforeAfterPayment);
        }
      }
    },
    [loansBeforeAfterPayment, setLoansBeforeAfterPayment]
  );

  return payment && customer ? (
    <Dialog open fullWidth maxWidth="md" onClose={handleClose}>
      <DialogTitle className={classes.dialogTitle}>Settle Payment</DialogTitle>
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
            payment={payment}
            customer={customer}
            loansBeforeAfterPayment={loansBeforeAfterPayment}
            setLoanBeforeAfterPayment={setLoanBeforeAfterPayment}
            setPayment={setPayment}
          />
        )}
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Box display="flex" flexDirection="column" width="100%">
          <Box display="flex" justifyContent="flex-end" width="100%">
            {errMsg && (
              <Typography variant="body1" color="secondary">
                {errMsg}
              </Typography>
            )}
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Box>
              {!isOnSelectLoans && (
                <Button
                  variant="contained"
                  color="default"
                  onClick={() => setIsOnSelectLoans(true)}
                >
                  Go Back
                </Button>
              )}
            </Box>
            <Box>
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
