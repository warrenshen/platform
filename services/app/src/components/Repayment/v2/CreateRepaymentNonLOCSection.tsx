import { Box, FormControl } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import LoansDataGrid from "components/Loans/LoansDataGrid";
import AccountFeesCard from "components/Repayment/v2/AccountFeesCard";
import HoldingAccountCreditsCard from "components/Repayment/v2/HoldingAccountCreditsCard";
import CardDivider from "components/Shared/Card/CardDivider";
import CurrencyInput from "components/Shared/FormInputs/CurrencyInput";
import SelectDropdown from "components/Shared/FormInputs/SelectDropdown";
import Text, { TextVariants } from "components/Shared/Text/Text";
import {
  FinancialSummaryFragment,
  LoanFragment,
  LoanTypeEnum,
  PaymentsInsertInput,
  useGetOpenFundedLoansByCompanyAndLoanTypeQuery,
} from "generated/graphql";
import {
  NonLOCCustomerPaymentOptions,
  PaymentOptionEnum,
  PaymentOptionToLabel,
  ProductTypeEnum,
  ProductTypeToLoanType,
} from "lib/enum";
import { Dispatch, SetStateAction, useEffect, useMemo } from "react";
import styled from "styled-components";

const StyledAlert = styled(Alert)`
  justify-content: center;
  align-items: center;
  height: 72px;
`;

interface Props {
  productType: ProductTypeEnum;
  financialSummary: FinancialSummaryFragment | null;
  payment: PaymentsInsertInput;
  setPayment: (payment: PaymentsInsertInput) => void;
  isPayAccountFeesChecked: boolean;
  setIsPayAccountFeesChecked: Dispatch<SetStateAction<boolean>>;
  isHoldingAccountCreditsChecked: boolean;
  setIsHoldingAccountCreditsChecked: Dispatch<SetStateAction<boolean>>;
  accountFeeTotal: number;
}

const CreateRepaymentNonLOCSection = ({
  productType,
  financialSummary,
  payment,
  setPayment,
  isPayAccountFeesChecked,
  setIsPayAccountFeesChecked,
  isHoldingAccountCreditsChecked,
  setIsHoldingAccountCreditsChecked,
  accountFeeTotal,
}: Props) => {
  // Select Loans
  const loanType = ProductTypeToLoanType[productType];

  const { data, error } = useGetOpenFundedLoansByCompanyAndLoanTypeQuery({
    skip: !payment || !loanType,
    fetchPolicy: "network-only",
    variables: {
      companyId: payment?.company_id || "",
      loanType: loanType || LoanTypeEnum.PurchaseOrder,
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const selectedLoans = useMemo(
    () =>
      data?.loans.filter(
        (loan) => payment.items_covered.loan_ids.indexOf(loan.id) >= 0
      ) || [],
    [data?.loans, payment.items_covered.loan_ids]
  );

  const notSelectedLoans = useMemo(
    () =>
      data?.loans.filter(
        (loan) =>
          !loan.closed_at && payment.items_covered.loan_ids.indexOf(loan.id) < 0
      ) || [],
    [data?.loans, payment.items_covered.loan_ids]
  );

  useEffect(() => {
    setPayment({
      ...payment,
      items_covered: {
        ...payment.items_covered,
        payment_option:
          selectedLoans.length > 0
            ? PaymentOptionEnum.InFull
            : PaymentOptionEnum.CustomAmount,
      },
    });
    // eslint-disable-next-line
  }, [selectedLoans.length]);

  const handleSelectedLoansChanged = useMemo(() => {
    return (loans: LoanFragment[]) => {
      setPayment({
        ...payment,
        items_covered: {
          ...payment.items_covered,
          loan_ids: payment.items_covered.loan_ids.filter(
            (loan_id: string) => !loans.find((loan) => loan.id === loan_id)
          ),
        },
      });
    };
  }, [payment, setPayment]);

  const handleNotSelectedLoansChanges = useMemo(() => {
    return (loans: LoanFragment[]) => {
      setPayment({
        ...payment,
        items_covered: {
          ...payment.items_covered,
          loan_ids: [
            ...payment.items_covered.loan_ids,
            ...loans.map((loan) => loan.id),
          ],
        },
      });
    };
  }, [payment, setPayment]);

  return (
    <Box display="flex" flexDirection="column">
      <Text textVariant={TextVariants.ParagraphLead}>
        How much do you want to pay?
      </Text>
      <SelectDropdown
        value={payment.items_covered.payment_option || ""}
        label="Payment option"
        options={NonLOCCustomerPaymentOptions}
        optionDisplayMapper={PaymentOptionToLabel}
        id="payment-option-dropdown"
        setValue={(value) => {
          setPayment({
            ...payment,
            items_covered: {
              ...payment.items_covered,
              payment_option: value as string,
              loan_ids:
                value === PaymentOptionEnum.CustomAmount
                  ? []
                  : payment.items_covered.loan_ids,
            },
          });
        }}
      />
      {payment.items_covered.payment_option === PaymentOptionEnum.InFull ? (
        <Box mt={4}>
          <Box width={1000} position="relative" ml="-168px">
            <Text textVariant={TextVariants.ParagraphLead}>
              Please, select loans which you would like to pay for (if you
              selected loans before, it will be in “selected Loans” table, you
              can manage it).
            </Text>
            <Box mb={3} className="repayments-loans-data-grid-selected">
              <Text textVariant={TextVariants.ParagraphLead}>
                Selected Loans
              </Text>
              <LoansDataGrid
                isArtifactVisible
                isDaysPastDueVisible
                isMaturityVisible
                isSortingDisabled
                isMultiSelectEnabled
                loans={selectedLoans}
                handleSelectLoans={handleSelectedLoansChanged}
              />
            </Box>

            <Box className="repayments-loans-data-grid-not-selected">
              <Text textVariant={TextVariants.ParagraphLead}>Not Selected</Text>
              <LoansDataGrid
                isArtifactVisible
                isDaysPastDueVisible
                isMaturityVisible
                isSortingDisabled
                isMultiSelectEnabled
                loans={notSelectedLoans}
                handleSelectLoans={handleNotSelectedLoansChanges}
              />
            </Box>
          </Box>
        </Box>
      ) : (
        <Box>
          <Box mt={2}>
            <FormControl fullWidth>
              <CurrencyInput
                label={"Custom Amount"}
                value={payment.requested_amount}
                dataCy="create-repayment-custom-amount-input-container"
                handleChange={(value) =>
                  setPayment({
                    ...payment,
                    requested_amount: value || 0.0,
                  })
                }
              />
            </FormControl>
          </Box>
          <Box mt={3} mb={3}>
            <StyledAlert severity="info">
              <Text textVariant={TextVariants.Paragraph} bottomMargin={0}>
                When you pay a custom amount, your repayment will be applied
                towards loans in the order your loans are coming due.
              </Text>
            </StyledAlert>
          </Box>
        </Box>
      )}
      {accountFeeTotal > 0 && (
        <AccountFeesCard
          accountFees={accountFeeTotal}
          payment={payment}
          setPayment={setPayment}
          isPayAccountFeesChecked={isPayAccountFeesChecked}
          setIsPayAccountFeesChecked={setIsPayAccountFeesChecked}
        />
      )}
      <Box mt={3}>
        <CardDivider />
        <Text textVariant={TextVariants.ParagraphLead}>
          How do you want to pay?
        </Text>
        <HoldingAccountCreditsCard
          accountCredits={
            financialSummary
              ? financialSummary.account_level_balance_payload?.credits_total
              : 0
          }
          isHoldingAccountCreditsChecked={isHoldingAccountCreditsChecked}
          payment={payment}
          setIsHoldingAccountCreditsChecked={setIsHoldingAccountCreditsChecked}
          setPayment={setPayment}
        />
      </Box>
    </Box>
  );
};

export default CreateRepaymentNonLOCSection;
