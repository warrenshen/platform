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
  Loans,
  LoanTypeEnum,
  Payments,
  PaymentsInsertInput,
  ProductTypeEnum,
  useGetPaymentForSettlementQuery,
  useLoansByCompanyAndLoanTypeForBankQuery,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import {
  PaymentMethodEnum,
  PaymentMethodToLabel,
  PaymentOptionEnum,
  ProductTypeToLoanType,
} from "lib/enum";
import {
  computeSettlementDateForPayment,
  getSettlementTimelineConfigFromContract,
} from "lib/finance/payments/advance";
import {
  calculateRepaymentEffect,
  CalculateRepaymentEffectResp,
  LoanBalance,
  LoanTransaction,
  settleRepaymentMutation,
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

  const [customer, setCustomer] = useState<Companies | null>(null);
  const [payment, setPayment] = useState<PaymentsInsertInput | null>(null);

  const [selectedLoanIds, setSelectedLoanIds] = useState<Loans["id"][]>([]);

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
        setSelectedLoanIds(existingPayment.items_covered?.loan_ids || []);
        setCustomer(existingPayment.company as Companies);
        setPayment({
          id: existingPayment.id,
          company_id: existingPayment.company_id,
          type: existingPayment.type,
          method: existingPayment.method,
          requested_amount: existingPayment.requested_amount,
          amount: existingPayment.amount,
          requested_payment_date: existingPayment.requested_payment_date,
          payment_date: existingPayment.payment_date,
          deposit_date: existingPayment.payment_date, // Default deposit_date to payment_date
          settlement_date: null,
          items_covered: existingPayment.items_covered,
        } as PaymentsInsertInput);
      } else {
        alert("Existing payment not found");
      }
    },
  });

  const loanType =
    !!productType && productType in ProductTypeToLoanType
      ? ProductTypeToLoanType[productType]
      : null;

  const { data } = useLoansByCompanyAndLoanTypeForBankQuery({
    skip: !payment,
    fetchPolicy: "network-only",
    variables: {
      companyId: payment?.company_id || "",
      loanType: loanType || LoanTypeEnum.PurchaseOrder,
    },
  });
  const allLoans = data?.loans;

  useEffect(() => {
    if (contract && payment?.method && payment?.deposit_date) {
      const settlementTimelineConfig = getSettlementTimelineConfigFromContract(
        contract
      );
      const settlementDate = computeSettlementDateForPayment(
        payment.method,
        payment.deposit_date,
        settlementTimelineConfig
      );
      setPayment((payment) => ({
        ...payment,
        settlement_date: settlementDate,
      }));
    }
  }, [contract, payment?.method, payment?.deposit_date, setPayment]);

  const [
    settleRepayment,
    { loading: isSettleRepaymentLoading },
  ] = useCustomMutation(settleRepaymentMutation);

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
      loan_ids: selectedLoanIds,
    });

    console.log({ type: "calculateRepaymentEffect", response });

    if (response.status !== "OK") {
      setErrMsg(response.msg || "");
    } else {
      setErrMsg("");

      if (!response.loans_to_show) {
        alert("Developer error: response does not include loans_afterwards.");
        return;
      }

      setCalculateEffectResponse(response);
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

    const response = await settleRepayment({
      variables: {
        company_id: customer.id,
        payment_id: payment.id,
        amount: payment.amount,
        deposit_date: payment.deposit_date,
        settlement_date: payment.settlement_date,
        items_covered: { ...payment.items_covered, loan_ids: selectedLoanIds },
        transaction_inputs: loansBeforeAfterPayment.map(
          (beforeAfterPaymentLoan) => beforeAfterPaymentLoan.transaction
        ),
        amount_as_credit_to_user: 0,
        is_line_of_credit: productType === ProductTypeEnum.LineOfCredit,
      },
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

  const selectedLoans = useMemo(() => {
    return !allLoans
      ? []
      : allLoans.filter((l) => selectedLoanIds.indexOf(l.id) >= 0);
  }, [allLoans, selectedLoanIds]);

  const isNextButtonDisabled =
    !payment?.amount || !payment?.deposit_date || !payment?.settlement_date;
  // TODO(warrenshen): also check if payment.items_covered is valid.
  const isSubmitButtonDisabled =
    isNextButtonDisabled || isSettleRepaymentLoading;

  return payment && customer ? (
    <Dialog open fullWidth maxWidth="md" onClose={handleClose}>
      <DialogTitle className={classes.dialogTitle}>
        {`Settle ${
          PaymentMethodToLabel[payment.method as PaymentMethodEnum]
        } Payment`}
      </DialogTitle>
      <DialogContent>
        {isOnSelectLoans ? (
          <SettleRepaymentSelectLoans
            payment={payment}
            customer={customer}
            allLoans={allLoans || []}
            selectedLoanIds={selectedLoanIds}
            selectedLoans={selectedLoans}
            setPayment={setPayment}
            setSelectedLoanIds={setSelectedLoanIds}
          />
        ) : (
          <SettleRepaymentConfirmEffect
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
                  disabled={isNextButtonDisabled}
                  variant="contained"
                  color="primary"
                  onClick={handleClickNext}
                >
                  Next
                </Button>
              ) : (
                <Button
                  disabled={isSubmitButtonDisabled}
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
