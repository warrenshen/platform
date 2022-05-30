import { Box, Typography } from "@material-ui/core";
import SettleRepaymentConfirmEffect from "components/Repayment/SettleRepaymentConfirmEffect";
import SettleRepaymentSelectLoans from "components/Repayment/SettleRepaymentSelectLoans";
import Modal from "components/Shared/Modal/Modal";
import {
  Companies,
  Loans,
  PaymentsInsertInput,
  PayorFragment,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import {
  PaymentOptionEnum,
  ProductTypeEnum,
  RepaymentMethodEnum,
  RepaymentMethodToLabel,
} from "lib/enum";
import {
  computeSettlementDateForPayment,
  getSettlementTimelineConfigFromContract,
} from "lib/finance/payments/advance";
import {
  CalculateRepaymentEffectResp,
  LoanBalance,
  LoanBeforeAfterPayment,
  LoanToShow,
  LoanTransaction,
  calculateRepaymentEffectMutation,
  settleRepaymentMutation,
} from "lib/finance/payments/repayment";
import { useEffect, useMemo, useState } from "react";

interface Props {
  isAmountToAccountFeesChecked: boolean;
  isAmountToLoansChecked: boolean;
  customer: Companies;
  payor: PayorFragment;
  payment: PaymentsInsertInput;
  setIsAmountToAccountFeesChecked: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  setIsAmountToLoansChecked: React.Dispatch<React.SetStateAction<boolean>>;
  setPayment: React.Dispatch<React.SetStateAction<PaymentsInsertInput>>;
  handleClose: () => void;
}

export default function SettleRepaymentModalLoans({
  isAmountToAccountFeesChecked,
  isAmountToLoansChecked,
  customer,
  payor,
  payment,
  setIsAmountToAccountFeesChecked,
  setIsAmountToLoansChecked,
  setPayment,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();

  // There are 2 states that we show, one when the user is selecting
  // the repayment method date, and repayment type, and the next is when
  // they have to "confirm" what they have selected.
  const [isOnSelectLoans, setIsOnSelectLoans] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const contract = customer?.contract || null;
  const productType = customer?.contract?.product_type || null;

  const [shouldPayPrincipalFirst, setShouldPayPrincipalFirst] = useState(false);
  const [repaymentEffectData, setRepaymentEffectData] = useState<
    CalculateRepaymentEffectResp["data"] | null
  >(null);
  const [loansBeforeAfterPayment, setLoansBeforeAfterPayment] = useState<
    LoanBeforeAfterPayment[]
  >([]);

  useEffect(() => {
    if (contract && payment?.method && payment?.deposit_date) {
      const settlementTimelineConfig =
        getSettlementTimelineConfigFromContract(contract);
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
    calculateRepaymentEffect,
    { loading: isCalculateRepaymentEffectLoading },
  ] = useCustomMutation(calculateRepaymentEffectMutation);

  const [settleRepayment, { loading: isSettleRepaymentLoading }] =
    useCustomMutation(settleRepaymentMutation);

  const handleClickNext = async () => {
    if (!payment || !customer) {
      alert("Developer error: payment or customer does not exist.");
      return;
    }

    const response = await calculateRepaymentEffect({
      variables: {
        company_id: customer.id,
        payment_option: PaymentOptionEnum.CustomAmount,
        amount: payment.amount,
        deposit_date: payment.deposit_date,
        settlement_date: payment.settlement_date,
        items_covered: payment.items_covered,
        should_pay_principal_first: shouldPayPrincipalFirst,
      },
    });

    if (response.status !== "OK") {
      setErrMsg(response.msg || "");
    } else {
      setErrMsg("");

      if (!response.data) {
        alert("Developer error: response does not include data.");
        return;
      }

      const repaymentEffectData = response.data;

      setRepaymentEffectData(repaymentEffectData);
      setLoansBeforeAfterPayment(
        repaymentEffectData.loans_to_show.map((loanToShow: LoanToShow) => {
          const beforeLoan = loanToShow.before_loan_balance;
          const afterLoan = loanToShow.after_loan_balance;
          return {
            loan_id: loanToShow.loan_id,
            loan_identifier: loanToShow.loan_identifier,
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
        items_covered: payment.items_covered,
        transaction_inputs: loansBeforeAfterPayment.map(
          (beforeAfterPaymentLoan) => beforeAfterPaymentLoan.transaction
        ),
        is_line_of_credit: productType === ProductTypeEnum.LineOfCredit,
      },
    });

    if (response.status !== "OK") {
      setErrMsg(response.msg || "Error!");
    } else {
      setErrMsg("");
      snackbar.showSuccess("Repayment settled.");
      handleClose();
    }
  };

  const setLoanBeforeAfterPayment = useMemo(
    () => (loanId: Loans["id"], field: string, value: number | null) => {
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

          transaction[field as "to_principal" | "to_interest" | "to_fees"] =
            value;
          transaction.amount =
            (transaction.to_principal || 0) +
            (transaction.to_interest || 0) +
            (transaction.to_fees || 0);
          loanBalanceAfter.outstanding_principal_balance =
            loanBalanceBefore.outstanding_principal_balance -
            (transaction.to_principal || 0);
          loanBalanceAfter.outstanding_interest =
            loanBalanceBefore.outstanding_interest -
            (transaction.to_interest || 0);
          loanBalanceAfter.outstanding_fees =
            loanBalanceBefore.outstanding_fees - (transaction.to_fees || 0);
          setLoansBeforeAfterPayment(newLoansBeforeAfterPayment);
        }
      }
    },
    [loansBeforeAfterPayment, setLoansBeforeAfterPayment]
  );

  const isFormLoading =
    isCalculateRepaymentEffectLoading || isSettleRepaymentLoading;
  /**
   * Do NOT allow bank user to go to next step if:
   * 1. Form is loading.
   * 2. Repayment amount is empty or 0.
   * 3. Repayment deposit date is empty.
   * 4. Settlement date is empty.
   * 5. Product type is non-LOC and no loans are selected AND amount to account fees is empty or 0.
   *    Essentially, repayment amount must go towards something: either loans or account fees (or both).
   */
  const isNextButtonDisabled =
    isFormLoading ||
    !payment?.amount ||
    !payment?.deposit_date ||
    !payment?.settlement_date ||
    !(
      productType === ProductTypeEnum.LineOfCredit ||
      (payment.items_covered?.loan_ids || []).length > 0 ||
      payment?.items_covered?.to_account_fees
    );
  const isSubmitButtonDisabled = isNextButtonDisabled;

  if (!payment || !customer) {
    return null;
  }

  return (
    <Modal
      isPrimaryActionDisabled={
        isOnSelectLoans ? isNextButtonDisabled : isSubmitButtonDisabled
      }
      title={`Settle ${
        RepaymentMethodToLabel[payment.method as RepaymentMethodEnum]
      } Repayment`}
      contentWidth={1000}
      primaryActionText={isOnSelectLoans ? "Next step" : "Settle repayment"}
      secondaryActionText={!isOnSelectLoans ? "Back to step 1" : null}
      handleClose={handleClose}
      handlePrimaryAction={
        isOnSelectLoans ? handleClickNext : handleClickConfirm
      }
      handleSecondaryAction={() => setIsOnSelectLoans(true)}
    >
      {isOnSelectLoans ? (
        <SettleRepaymentSelectLoans
          isAmountToAccountFeesChecked={isAmountToAccountFeesChecked}
          isAmountToLoansChecked={isAmountToLoansChecked}
          shouldPayPrincipalFirst={shouldPayPrincipalFirst}
          payment={payment}
          customer={customer}
          payor={payor!}
          setIsAmountToAccountFeesChecked={setIsAmountToAccountFeesChecked}
          setIsAmountToLoansChecked={setIsAmountToLoansChecked}
          setPayment={setPayment}
          setShouldPayPrincipalFirst={setShouldPayPrincipalFirst}
        />
      ) : (
        <SettleRepaymentConfirmEffect
          productType={productType as ProductTypeEnum}
          payableAmountPrincipal={
            repaymentEffectData?.payable_amount_principal || 0
          }
          payableAmountInterest={
            repaymentEffectData?.payable_amount_interest || 0
          }
          payment={payment}
          customer={customer}
          loansBeforeAfterPayment={loansBeforeAfterPayment}
          setLoanBeforeAfterPayment={setLoanBeforeAfterPayment}
          setPayment={setPayment}
        />
      )}
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
