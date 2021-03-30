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
import { Alert } from "@material-ui/lab";
import CreateRepaymentConfirmEffect from "components/Repayment/CreateRepaymentConfirmEffect";
import CreateRepaymentSelectLoans from "components/Repayment/CreateRepaymentSelectLoans";
import { PaymentTransferType } from "components/Shared/BankToBankTransfer";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  Companies,
  LoanFragment,
  PaymentsInsertInput,
  ProductTypeEnum,
  useGetCompanyWithDetailsByCompanyIdQuery,
  UserRolesEnum,
} from "generated/graphql";
import useSnackbar from "hooks/useSnackbar";
import { PaymentMethodEnum } from "lib/enum";
import {
  computeSettlementDateForPayment,
  getSettlementTimelineConfigFromContract,
} from "lib/finance/payments/advance";
import {
  calculateRepaymentEffect,
  CalculateRepaymentEffectResp,
  createRepayment,
  LoanBalance,
  LoanTransaction,
} from "lib/finance/payments/repayment";
import { LoanBeforeAfterPayment } from "lib/types";
import { useContext, useEffect, useState } from "react";

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

  const {
    user: { role },
  } = useContext(CurrentUserContext);
  const isBankUser = role === UserRolesEnum.BankAdmin;

  const { data } = useGetCompanyWithDetailsByCompanyIdQuery({
    fetchPolicy: "network-only",
    variables: {
      companyId: companyId,
    },
  });

  const company = data?.companies_by_pk;
  const contract = company?.contract || null;
  const financialSummary = company?.financial_summaries[0] || null;

  // There are 2 states that we show, one when the user is selecting
  // the payment method date, and payment type, and the next is when
  // they have to "confirm" what they have selected.
  const [isOnSelectLoans, setIsOnSelectLoans] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const [payment, setPayment] = useState<PaymentsInsertInput>({
    company_id: companyId,
    type: PaymentTransferType.ToBank,
    requested_amount: null,
    method: "",
    requested_payment_date: null,
    settlement_date: null,
    items_covered: {
      loan_ids: [],
      requested_to_principal: null,
      requested_to_interest: null,
      to_principal: null,
      to_interest: null,
    },
    company_bank_account_id: null,
  });
  // A payment option is the user's choice to payment the remaining balances on the loan, to
  // pay the minimum amount required, or to pay a custom amount.
  const [paymentOption, setPaymentOption] = useState("");

  const [
    calculateEffectResponse,
    setCalculateEffectResponse,
  ] = useState<CalculateRepaymentEffectResp | null>(null);
  const [loansBeforeAfterPayment, setLoansBeforeAfterPayment] = useState<
    LoanBeforeAfterPayment[]
  >([]);

  useEffect(() => {
    if (payment.method && payment.requested_payment_date) {
      const settlementTimelineConfig = getSettlementTimelineConfigFromContract(
        contract
      );
      const settlementDate = computeSettlementDateForPayment(
        payment.method || null,
        payment.requested_payment_date,
        settlementTimelineConfig
      );
      setPayment((payment) => ({
        ...payment,
        settlement_date: settlementDate,
      }));
    }
  }, [contract, payment.method, payment.requested_payment_date, setPayment]);

  const handleClickNext = async () => {
    const response = await calculateRepaymentEffect({
      company_id: companyId,
      payment_option:
        productType === ProductTypeEnum.LineOfCredit
          ? "pay_in_full"
          : paymentOption,
      // We use payment.requested_amount here since we want to calculate what is
      // the effect of this repayment assumption its amount is the requested amount.
      amount: payment.requested_amount,
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
    if (payment.requested_amount <= 0) {
      setErrMsg("Payment amount must be larger than 0");
      return;
    }

    const response = await createRepayment({
      company_id: companyId,
      payment: { ...payment },
      is_line_of_credit: productType === ProductTypeEnum.LineOfCredit,
    });

    if (response.status !== "OK") {
      setErrMsg(response.msg);
    } else {
      setErrMsg("");
      snackbar.showSuccess("Success! Payment submitted for review by Bespoke.");
      handleClose();
    }
  };

  const isNextButtonDisabled =
    !payment.method ||
    !payment.requested_payment_date ||
    !payment.settlement_date ||
    (productType !== ProductTypeEnum.LineOfCredit && !paymentOption) ||
    (paymentOption === "custom" && !payment.requested_amount);
  const isActionButtonDisabled =
    !payment.method || payment.requested_amount <= 0;
  const actionBtnText =
    payment.method === PaymentMethodEnum.ReverseDraftACH
      ? "Schedule"
      : "Notify";

  return (
    <Dialog open fullWidth maxWidth="md" onClose={handleClose}>
      <DialogTitle className={classes.dialogTitle}>Make Payment</DialogTitle>
      <DialogContent style={{ minHeight: 400 }}>
        <Box display="flex" flexDirection="column">
          {isBankUser && (
            <Box mb={3}>
              <Alert severity="info">
                Note: only bank admins may create payments on behalf of
                customers. You (a bank admin) are creating a payment on behalf
                of this customer.
              </Alert>
            </Box>
          )}
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
              companyId={companyId}
              productType={productType}
              payableAmountPrincipal={
                calculateEffectResponse?.payable_amount_principal || 0
              }
              payableAmountInterest={
                calculateEffectResponse?.payable_amount_interest || 0
              }
              payment={payment}
              loansBeforeAfterPayment={loansBeforeAfterPayment}
              setPayment={setPayment}
            />
          )}
        </Box>
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
