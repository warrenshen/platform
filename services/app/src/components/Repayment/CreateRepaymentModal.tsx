import { Box, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import CreateRepaymentConfirmEffect from "components/Repayment/CreateRepaymentConfirmEffect";
import CreateRepaymentSelectLoans from "components/Repayment/CreateRepaymentSelectLoans";
import Modal from "components/Shared/Modal/Modal";
import { CurrentCustomerContext } from "contexts/CurrentCustomerContext";
import {
  CurrentUserContext,
  isRoleBankUser,
} from "contexts/CurrentUserContext";
import {
  Companies,
  Loans,
  PaymentsInsertInput,
  useGetCompanyWithDetailsByCompanyIdQuery,
  useGetCustomerAccountQuery,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import {
  computeRequestedWithdrawCutoffDate,
  formatDateString,
  todayAsDateStringServer,
} from "lib/date";
import {
  PaymentTypeEnum,
  ProductTypeEnum,
  RepaymentMethodEnum,
} from "lib/enum";
import {
  computeSettlementDateForPayment,
  getSettlementTimelineConfigFromContract,
} from "lib/finance/payments/advance";
import {
  CalculateRepaymentEffectResp,
  LoanBeforeAfterPayment,
  LoanToShow,
  calculateRepaymentEffectMutation,
  createRepaymentMutation,
  getLoansBeforeAfterPayment,
} from "lib/finance/payments/repayment";
import { useContext, useEffect, useState } from "react";

interface Props {
  companyId: Companies["id"];
  productType: ProductTypeEnum;
  initiallySelectedLoanIds: Loans["id"][];
  handleClose: () => void;
}

export default function CreateRepaymentModal({
  companyId,
  productType,
  initiallySelectedLoanIds,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();

  const {
    user: { role },
  } = useContext(CurrentUserContext);
  const isBankUser = isRoleBankUser(role);

  const { financialSummary } = useContext(CurrentCustomerContext);

  const { data } = useGetCompanyWithDetailsByCompanyIdQuery({
    fetchPolicy: "network-only",
    variables: {
      companyId: companyId,
    },
  });

  const company = data?.companies_by_pk;
  const contract = company?.contract || null;

  // There are 2 states that we show, one when the user is selecting
  // the repayment method date, and repayment type, and the next is when
  // they have to "confirm" what they have selected.
  const [isOnSelectLoans, setIsOnSelectLoans] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const [payment, setPayment] = useState<PaymentsInsertInput>({
    company_id: companyId,
    type: PaymentTypeEnum.Repayment,
    requested_amount: null,
    method: "",
    requested_payment_date: null,
    settlement_date: null,
    items_covered: {
      loan_ids: initiallySelectedLoanIds,
      requested_to_principal: null,
      requested_to_interest: null,
      requested_to_account_fees: null,
      // A payment option is the user's choice to pay the remaining balances on
      // the loan, to pay the minimum amount required, or to pay a custom amount.
      payment_option: null,
    },
    company_bank_account_id: null,
  });
  const [isPayAccountFeesVisible, setIsPayAccountFeesVisible] =
    useState<boolean>(false);
  const [repaymentEffectData, setRepaymentEffectData] = useState<
    CalculateRepaymentEffectResp["data"] | null
  >(null);
  const [loansBeforeAfterPayment, setLoansBeforeAfterPayment] = useState<
    LoanBeforeAfterPayment[]
  >([]);

  // Select Account Fees
  const accountQuery = useGetCustomerAccountQuery({
    fetchPolicy: "network-only",
    skip: !payment,
    variables: {
      company_id: payment?.company_id || "",
    },
  });

  if (accountQuery.error) {
    alert(`Error in query (details in console): ${accountQuery.error.message}`);
  }

  const accountBalancePayload = financialSummary?.account_level_balance_payload;
  const accountFeeTotal =
    accountBalancePayload?.fees_total != null
      ? accountBalancePayload.fees_total
      : null;

  const paymentOption = payment.items_covered.payment_option;

  useEffect(() => {
    if (payment.method && payment.requested_payment_date) {
      const settlementTimelineConfig =
        getSettlementTimelineConfigFromContract(contract);
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

  const [
    calculateRepaymentEffect,
    { loading: isCalculateRepaymentEffectLoading },
  ] = useCustomMutation(calculateRepaymentEffectMutation);

  const [createRepayment, { loading: isCreateRepaymentLoading }] =
    useCustomMutation(createRepaymentMutation);

  const handleClickNext = async () => {
    const dateAdjustmentAtSubmission = computeRequestedWithdrawCutoffDate(
      todayAsDateStringServer()
    );

    if (payment.method === RepaymentMethodEnum.ReverseDraftACH) {
      if (dateAdjustmentAtSubmission > payment.requested_payment_date) {
        setErrMsg(
          `The selected Requested Withdraw Date of ${formatDateString(
            payment.requested_payment_date
          )} is invalid. Based on the current time, the earliest valid date is ${formatDateString(
            dateAdjustmentAtSubmission
          )}.`
        );
        return;
      }
    }

    const response = await calculateRepaymentEffect({
      variables: {
        company_id: companyId,
        payment_option:
          productType === ProductTypeEnum.LineOfCredit
            ? "custom_amount"
            : paymentOption,
        // We use payment.requested_amount here since we want to calculate what is
        // the effect of this repayment assumption its amount is the requested amount.
        amount: payment.requested_amount,
        deposit_date: payment.requested_payment_date,
        settlement_date: payment.settlement_date,
        items_covered: {
          ...payment.items_covered,
          to_account_fees: payment.items_covered.requested_to_account_fees || 0,
        },
        should_pay_principal_first: false, // Always false for "create repayment".
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
      setPayment({
        ...payment,
        requested_amount: repaymentEffectData.amount_to_pay || null,
        items_covered: {
          ...payment.items_covered,
          loan_ids: repaymentEffectData.loans_to_show.map(
            (loanToShow: LoanToShow) => loanToShow.loan_id
          ),
        },
      });
      setLoansBeforeAfterPayment(
        getLoansBeforeAfterPayment(repaymentEffectData)
      );
      setIsOnSelectLoans(false);
    }
  };

  const handleClickConfirm = async () => {
    if (payment.requested_amount <= 0) {
      setErrMsg("Payment amount must be larger than 0");
      return;
    }

    // Double check to make sure selected account fee payment is not greater than amount owed
    if (isPayAccountFeesVisible) {
      const accountFeePayment =
        payment.items_covered["requested_to_account_fees"];

      if (accountFeePayment > accountFeeTotal) {
        setErrMsg(
          `You have enter $${accountFeePayment} for paying your account fees. ` +
            `This is higher than than the total amount owed of $${accountFeeTotal}. ` +
            `Please set your amount at or below the total owed.`
        );
      }
    }

    // Loan Repayment
    const response = await createRepayment({
      variables: {
        company_id: companyId,
        payment: {
          company_id: payment.company_id,
          type: payment.type,
          requested_amount: payment.requested_amount,
          method: payment.method,
          requested_payment_date: payment.requested_payment_date,
          settlement_date: payment.settlement_date,
          items_covered: {
            loan_ids: payment.items_covered.loan_ids,
            requested_to_principal:
              payment.items_covered.requested_to_principal || 0.0, // If user leaves this blank, coerce to zero.
            requested_to_interest:
              payment.items_covered.requested_to_interest || 0.0, // If user leaves this blank, coerce to zero.
            requested_to_account_fees:
              payment.items_covered.requested_to_account_fees || 0.0, // If user leaves this blank, coerce to zero.
            payment_option: paymentOption,
            forecasted_principal: repaymentEffectData?.loans_to_show.reduce(
              (acc, { transaction }) => acc + (transaction.to_principal || 0.0),
              0.0
            ),
            forecasted_interest: repaymentEffectData?.loans_to_show.reduce(
              (acc, { transaction }) => acc + (transaction.to_interest || 0.0),
              0.0
            ),
            forecasted_late_fees: repaymentEffectData?.loans_to_show.reduce(
              (acc, { transaction }) => acc + (transaction.to_fees || 0.0),
              0.0
            ),
            forecasted_holding_account: payment.items_covered.to_user_credit,
          },
          company_bank_account_id: payment.company_bank_account_id,
        },
        is_line_of_credit: productType === ProductTypeEnum.LineOfCredit,
      },
    });

    if (response.status !== "OK") {
      setErrMsg(response.msg);
    } else {
      setErrMsg("");
      snackbar.showSuccess(
        "Repayment submitted for review by Bespoke Financial."
      );
      handleClose();
    }
  };

  const isFormLoading =
    isCalculateRepaymentEffectLoading || isCreateRepaymentLoading;
  const isNextButtonDisabled =
    isFormLoading ||
    !payment.method ||
    !payment.requested_payment_date ||
    !payment.settlement_date ||
    (productType !== ProductTypeEnum.LineOfCredit && !paymentOption) ||
    (paymentOption === "custom_amount" && !payment.requested_amount) ||
    (payment.method === RepaymentMethodEnum.ReverseDraftACH &&
      !payment.company_bank_account_id) ||
    (isPayAccountFeesVisible &&
      !payment.items_covered["requested_to_account_fees"]) ||
    (isPayAccountFeesVisible &&
      payment.items_covered["requested_to_account_fees"] &&
      payment.items_covered["requested_to_account_fees"] > accountFeeTotal);
  const isSubmitButtonDisabled =
    isNextButtonDisabled || payment.requested_amount <= 0;
  const submitButtonText =
    payment.method === RepaymentMethodEnum.ReverseDraftACH
      ? "Schedule repayment"
      : "Notify Bespoke Financial";

  return (
    <Modal
      isPrimaryActionDisabled={
        isOnSelectLoans ? isNextButtonDisabled : isSubmitButtonDisabled
      }
      title={"Make Repayment"}
      subtitle={isOnSelectLoans ? "Step 1 of 2" : "Step 2 of 2"}
      contentWidth={1000}
      primaryActionText={isOnSelectLoans ? "Next step" : submitButtonText}
      secondaryActionText={!isOnSelectLoans ? "Back to step 1" : null}
      handleClose={handleClose}
      handlePrimaryAction={
        isOnSelectLoans ? handleClickNext : handleClickConfirm
      }
      handleSecondaryAction={() => setIsOnSelectLoans(true)}
    >
      <>
        {isBankUser && (
          <Box mt={2} mb={6}>
            <Alert severity="info">
              <Typography variant="body1">
                Warning: you are creating a repayment on behalf of this customer
                (only bank admins can do this).
              </Typography>
            </Alert>
          </Box>
        )}
        {isOnSelectLoans ? (
          <CreateRepaymentSelectLoans
            productType={productType}
            financialSummary={financialSummary}
            payment={payment}
            setPayment={setPayment}
            isPayAccountFeesVisible={isPayAccountFeesVisible}
            setIsPayAccountFeesVisible={setIsPayAccountFeesVisible}
            accountFeeTotal={accountFeeTotal}
          />
        ) : (
          <CreateRepaymentConfirmEffect
            companyId={companyId}
            productType={productType}
            payableAmountPrincipal={
              repaymentEffectData?.payable_amount_principal || 0
            }
            payableAmountInterest={
              repaymentEffectData?.payable_amount_interest || 0
            }
            payableAmountAccountFee={
              payment?.items_covered["requested_to_account_fees"] || 0
            }
            payment={payment}
            loansBeforeAfterPayment={loansBeforeAfterPayment}
            isPayAccountFeesVisible={isPayAccountFeesVisible}
            showAddress={true}
          />
        )}
        {errMsg && (
          <Box display="flex" width="100%" mt={2}>
            <Typography variant="body1" color="secondary">
              {errMsg}
            </Typography>
          </Box>
        )}
      </>
    </Modal>
  );
}
