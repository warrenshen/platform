import { Box, Step, StepLabel, Stepper, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import CreateRepaymentConfigureRepayment from "components/Repayment/v2/CreateRepaymentConfigureRepayment";
import CreateRepaymentReviewRepayment from "components/Repayment/v2/CreateRepaymentReviewRepayment";
import { ApproveBlue } from "components/Shared/Colors/GlobalColors";
import Modal from "components/Shared/Modal/Modal";
import { CurrentCustomerContext } from "contexts/CurrentCustomerContext";
import { CurrentUserContext } from "contexts/CurrentUserContext";
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
  PaymentOptionEnum,
  PaymentTypeEnum,
  PlatformModeEnum,
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
  calculateRepaymentEffectNewMutation,
  createRepaymentMutation,
  getLoansBeforeAfterPayment,
} from "lib/finance/payments/repayment";
import { useContext, useEffect, useState } from "react";
import styled from "styled-components";

const StyledStep = styled(Step)<{}>`
  .MuiStepIcon-root.MuiStepIcon-active {
    color: ${ApproveBlue};
  }
`;

const CREATE_REPAYMENT_MODAL_STEPS = [
  "Configure Repayment",
  "Review Repayment",
];

interface Props {
  companyId: Companies["id"];
  productType: ProductTypeEnum;
  initiallySelectedLoanIds: Loans["id"][];
  handleClose: () => void;
}

const CreateRepaymentModalNew = ({
  companyId,
  productType,
  initiallySelectedLoanIds,
  handleClose,
}: Props) => {
  const snackbar = useSnackbar();

  const {
    user: { platformMode },
  } = useContext(CurrentUserContext);
  const isBankUser = platformMode === PlatformModeEnum.Bank;

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
  const [isOnConfigureRepayment, setIsOnConfigureRepayment] = useState(true);
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
      requested_from_holding_account: 0,
    },
    company_bank_account_id: null,
  });
  const [isPayAccountFeesChecked, setIsPayAccountFeesChecked] =
    useState<boolean>(false);
  const [repaymentEffectData, setRepaymentEffectData] = useState<
    CalculateRepaymentEffectResp["data"] | null
  >(null);
  const [loansBeforeAfterPayment, setLoansBeforeAfterPayment] = useState<
    LoanBeforeAfterPayment[]
  >([]);
  const [payEntireBalance, setPayEntireBalance] = useState<boolean>(false);
  const [isHoldingAccountCreditsChecked, setIsHoldingAccountCreditsChecked] =
    useState(false);

  // Select Account Fees
  const accountQuery = useGetCustomerAccountQuery({
    fetchPolicy: "network-only",
    skip: !payment,
    variables: {
      company_id: companyId,
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

  // FOR LOC
  const amountLeftoverForAccountFees =
    payment.requested_amount -
    ((financialSummary?.total_outstanding_principal || 0) +
      (financialSummary?.total_outstanding_interest || 0));

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
  }, [
    contract,
    payment.method,
    payment.requested_payment_date,
    setPayment,
    payEntireBalance,
  ]);

  useEffect(() => {
    let requestedToAccountFees = 0;
    if (productType === ProductTypeEnum.LineOfCredit && payEntireBalance) {
      requestedToAccountFees = accountFeeTotal;
    } else if (
      productType === ProductTypeEnum.LineOfCredit &&
      !payEntireBalance
    ) {
      requestedToAccountFees =
        amountLeftoverForAccountFees > 0 ? amountLeftoverForAccountFees : 0;
    } else if (
      productType !== ProductTypeEnum.LineOfCredit &&
      isPayAccountFeesChecked
    ) {
      requestedToAccountFees =
        payment.items_covered?.requested_to_account_fees || 0;
    }

    if (payEntireBalance) {
      setPayment((payment) => ({
        ...payment,
        requested_amount:
          payment.requested_amount ||
          (financialSummary?.total_outstanding_principal || 0) +
            (financialSummary
              ? financialSummary.total_outstanding_interest
              : 0) +
            accountFeeTotal,
        items_covered: {
          ...payment.items_covered,
          payment_option: PaymentOptionEnum.InFull,
          requested_to_account_fees: requestedToAccountFees,
        },
      }));
    } else {
      setPayment((payment) => ({
        ...payment,
        items_covered: {
          ...payment.items_covered,
          payment_option: PaymentOptionEnum.CustomAmount,
          requested_to_account_fees: requestedToAccountFees,
        },
      }));
    }
  }, [
    accountFeeTotal,
    financialSummary,
    payEntireBalance,
    amountLeftoverForAccountFees,
    productType,
    isPayAccountFeesChecked,
    payment.items_covered?.requested_to_account_fees,
  ]);

  const [
    calculateRepaymentEffect,
    { loading: isCalculateRepaymentEffectLoading },
  ] = useCustomMutation(calculateRepaymentEffectNewMutation);

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
        payment_option: paymentOption,
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
        should_use_holding_account_credits: isHoldingAccountCreditsChecked,
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

      if (productType === ProductTypeEnum.LineOfCredit) {
        const {
          amount_to_pay,
          payable_amount_principal,
          payable_amount_interest,
          amount_from_holding_account,
        } = repaymentEffectData;
        let amountTowardsPrincipal = 0;
        let amountTowardsInterest = 0;
        let amountTowardsAccountFees = 0;
        if (amount_to_pay <= payable_amount_interest) {
          amountTowardsInterest = amount_to_pay;
        } else if (
          amount_to_pay <=
          payable_amount_interest + payable_amount_principal
        ) {
          amountTowardsInterest = payable_amount_interest;
          amountTowardsPrincipal = amount_to_pay - payable_amount_interest;
        } else {
          amountTowardsInterest = payable_amount_interest;
          amountTowardsPrincipal = payable_amount_principal;
          amountTowardsAccountFees =
            amount_to_pay - payable_amount_interest - payable_amount_principal;
        }
        setPayment({
          ...payment,
          requested_amount: repaymentEffectData.amount_to_pay || null,
          items_covered: {
            ...payment.items_covered,
            requested_from_holding_account: amount_from_holding_account,
            requested_to_principal: amountTowardsPrincipal,
            requested_to_interest: amountTowardsInterest,
            requested_to_account_fees: amountTowardsAccountFees,
            loan_ids: repaymentEffectData.loans_to_show.map(
              (loanToShow: LoanToShow) => loanToShow.loan_id
            ),
          },
        });
      } else {
        const {
          amount_to_pay,
          amount_to_account_fees,
          amount_from_holding_account,
        } = repaymentEffectData;
        setPayment({
          ...payment,
          requested_amount: amount_to_pay || null,
          items_covered: {
            ...payment.items_covered,
            requested_from_holding_account: amount_from_holding_account,
            requested_to_account_fees: amount_to_account_fees,
            loan_ids: repaymentEffectData.loans_to_show.map(
              (loanToShow: LoanToShow) => loanToShow.loan_id
            ),
          },
        });
      }
      setLoansBeforeAfterPayment(
        getLoansBeforeAfterPayment(repaymentEffectData)
      );
      setIsOnConfigureRepayment(false);
    }
  };

  const handleClickConfirm = async () => {
    if (payment.requested_amount <= 0) {
      setErrMsg("Payment amount must be larger than 0");
      return;
    }

    // Double check to make sure selected account fee payment is not greater than amount owed
    if (isPayAccountFeesChecked) {
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
            requested_from_holding_account:
              payment.items_covered.requested_from_holding_account || 0.0,
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
    (isPayAccountFeesChecked &&
      !payment.items_covered["requested_to_account_fees"]) ||
    (isPayAccountFeesChecked &&
      payment.items_covered["requested_to_account_fees"] &&
      payment.items_covered["requested_to_account_fees"] > accountFeeTotal) ||
    payment.items_covered["requested_from_holding_account"] >
      payment.requested_amount;
  const isSubmitButtonDisabled =
    isNextButtonDisabled || payment.requested_amount <= 0;
  const submitButtonText =
    payment.method === RepaymentMethodEnum.ReverseDraftACH
      ? "Schedule repayment"
      : "Notify Bespoke Financial";

  return (
    <Modal
      isPrimaryActionDisabled={
        isOnConfigureRepayment ? isNextButtonDisabled : isSubmitButtonDisabled
      }
      title={"Make Repayment"}
      contentWidth={1000}
      primaryActionText={
        isOnConfigureRepayment ? "Next step" : submitButtonText
      }
      secondaryActionText={!isOnConfigureRepayment ? "Back to step 1" : null}
      handleClose={handleClose}
      handlePrimaryAction={
        isOnConfigureRepayment ? handleClickNext : handleClickConfirm
      }
      handleSecondaryAction={() => setIsOnConfigureRepayment(true)}
    >
      <>
        <Box display="flex" justifyContent="center">
          <Box width={500}>
            <Stepper
              activeStep={isOnConfigureRepayment ? 0 : 1}
              alternativeLabel
            >
              {CREATE_REPAYMENT_MODAL_STEPS.map((label) => (
                <StyledStep key={label}>
                  <StepLabel>{label}</StepLabel>
                </StyledStep>
              ))}
            </Stepper>
          </Box>
        </Box>
        {isBankUser && (
          <Box mt={2} mb={6}>
            <Alert severity="warning">
              <Typography variant="body1">
                Warning: you are creating a repayment on behalf of this customer
                (only bank admins can do this).
              </Typography>
            </Alert>
          </Box>
        )}
        {isOnConfigureRepayment ? (
          <CreateRepaymentConfigureRepayment
            productType={productType}
            financialSummary={financialSummary}
            payment={payment}
            setPayment={setPayment}
            accountFeeTotal={accountFeeTotal}
            payEntireBalance={payEntireBalance}
            setPayEntireBalance={setPayEntireBalance}
            isPayAccountFeesChecked={isPayAccountFeesChecked}
            setIsPayAccountFeesChecked={setIsPayAccountFeesChecked}
            isHoldingAccountCreditsChecked={isHoldingAccountCreditsChecked}
            setIsHoldingAccountCreditsChecked={
              setIsHoldingAccountCreditsChecked
            }
          />
        ) : (
          <CreateRepaymentReviewRepayment
            companyId={companyId}
            productType={productType}
            payableAmountPrincipal={
              repaymentEffectData?.payable_amount_principal || 0
            }
            payableAmountInterest={
              repaymentEffectData?.payable_amount_interest || 0
            }
            payableAmountAccountFee={accountFeeTotal}
            payment={payment}
            loansBeforeAfterPayment={loansBeforeAfterPayment}
            isPayAccountFeesChecked={isPayAccountFeesChecked}
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
};

export default CreateRepaymentModalNew;
