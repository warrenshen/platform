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
import CreateRepaymentConfirmEffect from "components/Repayment/CreateRepaymentConfirmEffect";
import CreateRepaymentSelectLoans from "components/Repayment/CreateRepaymentSelectLoans";
import { PaymentTransferType } from "components/Shared/BankToBankTransfer";
import {
  Companies,
  LoanFragment,
  PaymentsInsertInput,
  ProductTypeEnum,
  useGetCompanyWithDetailsByCompanyIdQuery,
} from "generated/graphql";
import useSnackbar from "hooks/useSnackbar";
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
  companyId: Companies["id"];
  productType: ProductTypeEnum | null;
  selectedLoans: LoanFragment[];
  handleClose: () => void;
}

function CreateRepaymentModal({
  companyId,
  productType,
  selectedLoans,
  handleClose,
}: Props) {
  const classes = useStyles();
  const snackbar = useSnackbar();

  const { data } = useGetCompanyWithDetailsByCompanyIdQuery({
    variables: {
      companyId: companyId,
    },
  });

  const company = data?.companies_by_pk;
  const contract = company?.contract || null;
  const financialSummary = company?.financial_summary || null;

  // There are 2 states that we show, one when the user is selecting
  // the payment method date, and payment type, and the next is when
  // they have to "confirm" what they have selected.
  const [isOnSelectLoans, setIsOnSelectLoans] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const [loansBeforeAfterPayment, setLoansBeforeAfterPayment] = useState<
    LoanBeforeAfterPayment[]
  >([]);
  // A payment option is the user's choice to payment the remaining balances on the loan, to
  // pay the minimum amount required, or to pay a custom amount.
  const [paymentOption, setPaymentOption] = useState("");
  const [payment, setPayment] = useState<PaymentsInsertInput>({
    company_id: companyId,
    type: PaymentTransferType.ToBank,
    amount: 0.0,
    method: "",
    payment_date: null,
    settlement_date: null,
  });

  useEffect(() => {
    if (payment.method && payment.payment_date) {
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
        settlement_date: settlementDate,
      }));
    }
  }, [contract, payment.method, payment.payment_date, setPayment]);

  const handleClickNext = async () => {
    if (payment.amount && payment.amount.length > 0) {
      payment.amount = parseFloat(payment.amount);
    }

    const response = await calculateEffectOfPayment({
      payment: { ...payment },
      company_id: companyId,
      payment_option: paymentOption,
      loan_ids: selectedLoans.map((selectedLoan) => selectedLoan.id),
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
      payment: { ...payment },
      company_id: companyId,
      loan_ids: loansBeforeAfterPayment.map(
        (loanBeforeAfterPayment) => loanBeforeAfterPayment.loan_id
      ),
    });

    if (response.status !== "OK") {
      setErrMsg(response.msg);
    } else {
      setErrMsg("");
      snackbar.showSuccess("Success! Payment submitted for review by Bespoke.");
      handleClose();
    }
  };

  const isPaymentMethodSet = !!payment.method;

  const isNextButtonEnabled =
    payment.payment_date && isPaymentMethodSet && paymentOption !== "";
  const isActionButtonEnabled = isPaymentMethodSet && payment.amount > 0;
  const actionBtnText =
    payment.method === PaymentMethodEnum.ReverseDraftACH
      ? "Schedule"
      : "Notify";

  return (
    <Dialog open fullWidth maxWidth="md" onClose={handleClose}>
      <DialogTitle className={classes.dialogTitle}>Pay Off Loans</DialogTitle>
      <DialogContent style={{ minHeight: 400 }}>
        {isOnSelectLoans ? (
          <CreateRepaymentSelectLoans
            productType={productType}
            financialSummary={financialSummary}
            selectedLoans={selectedLoans}
            payment={payment}
            paymentOption={paymentOption}
            setPayment={setPayment}
            setPaymentOption={setPaymentOption}
          />
        ) : (
          <CreateRepaymentConfirmEffect
            loansBeforeAfterPayment={loansBeforeAfterPayment}
            payment={payment}
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
