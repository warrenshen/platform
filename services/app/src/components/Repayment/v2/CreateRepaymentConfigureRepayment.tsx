import { Box, Divider, Typography } from "@material-ui/core";
import CreateRepaymentLineofCreditSectionNew from "components/Repayment/v2/CreateRepaymentLineOfCreditSectionNew";
import CreateRepaymentNonLOCSection from "components/Repayment/v2/CreateRepaymentNonLOCSection";
import ExpectedDatePreview from "components/Repayment/v2/ExpectedDatePreviewNew";
import CompanyBank from "components/Shared/BankToBankTransfer/CompanyBank";
import { SecondaryTextColor } from "components/Shared/Colors/GlobalColors";
import DateInput from "components/Shared/FormInputs/DateInput";
import SelectDropdown from "components/Shared/FormInputs/SelectDropdown";
import Text, { TextVariants } from "components/Shared/Text/Text";
import {
  BankAccounts,
  FinancialSummaryFragment,
  PaymentsInsertInput,
} from "generated/graphql";
import { DateInputIcon } from "icons";
import { computeRequestedWithdrawCutoffDate } from "lib/date";
import {
  AllRepaymentMethods,
  ProductTypeEnum,
  RepaymentMethodEnum,
  RepaymentMethodToDropdownLabel,
} from "lib/enum";
import { Dispatch, SetStateAction } from "react";

interface Props {
  productType: ProductTypeEnum;
  financialSummary: FinancialSummaryFragment | null;
  payment: PaymentsInsertInput;
  setPayment: (payment: PaymentsInsertInput) => void;
  accountFeeTotal: number;
  payEntireBalance: boolean;
  setPayEntireBalance: Dispatch<SetStateAction<boolean>>;
  isPayAccountFeesChecked: boolean;
  setIsPayAccountFeesChecked: Dispatch<SetStateAction<boolean>>;
  isHoldingAccountCreditsChecked: boolean;
  setIsHoldingAccountCreditsChecked: Dispatch<SetStateAction<boolean>>;
}

export default function CreateRepaymentConfigureRepayment({
  productType,
  financialSummary,
  payment,
  setPayment,
  accountFeeTotal,
  payEntireBalance,
  setPayEntireBalance,
  isPayAccountFeesChecked,
  setIsPayAccountFeesChecked,
  isHoldingAccountCreditsChecked,
  setIsHoldingAccountCreditsChecked,
}: Props) {
  const isReverseDraftACH =
    payment.method === RepaymentMethodEnum.ReverseDraftACH;
  /**
   * If payment method is reverse draft ACH and today's date is X,
   * the earliest the payment date of repayment may be is:
   *
   * Step 1: figure out Y (the 1st business day starting from X).
   * 1. X is a business day, Y equals X.
   * 2. X is a NOT a business day, Y equals the soonest business day after X.
   *
   * Step 2: calculate earliest payment date based on Y.
   * 1. 1 business day after Y, if it is currently before 12pm (PST).
   * 2. 2 business days after Y, if it is currently after 12pm (PST).
   *
   * The above rules give Bespoke Financial's Operations team time to
   * set up a reverse draft ACH repayment with the desired payment date.
   */
  const disabledBefore = isReverseDraftACH
    ? // ? computeRequestedWithdrawCutoffDate(todayAsDateStringServer())
      computeRequestedWithdrawCutoffDate("2022-01-15")
    : undefined;

  return (
    <Box width={664} marginLeft={21}>
      <Box>
        {productType === ProductTypeEnum.LineOfCredit ? (
          <CreateRepaymentLineofCreditSectionNew
            financialSummary={financialSummary}
            payment={payment}
            setPayment={setPayment}
            accountFeeTotal={accountFeeTotal}
            payEntireBalance={payEntireBalance}
            setPayEntireBalance={setPayEntireBalance}
            isHoldingAccountCreditsChecked={isHoldingAccountCreditsChecked}
            setIsHoldingAccountCreditsChecked={
              setIsHoldingAccountCreditsChecked
            }
          />
        ) : (
          <CreateRepaymentNonLOCSection
            productType={productType}
            financialSummary={financialSummary}
            payment={payment}
            setPayment={setPayment}
            isPayAccountFeesChecked={isPayAccountFeesChecked}
            setIsPayAccountFeesChecked={setIsPayAccountFeesChecked}
            isHoldingAccountCreditsChecked={isHoldingAccountCreditsChecked}
            setIsHoldingAccountCreditsChecked={
              setIsHoldingAccountCreditsChecked
            }
            accountFeeTotal={accountFeeTotal}
          />
        )}
      </Box>
      <Box my={6}>
        <Divider light />
      </Box>
      <Box>
        <Text textVariant={TextVariants.Paragraph} bottomMargin={12}>
          Which repayment method do you plan to pay with?
        </Text>
        <SelectDropdown
          value={payment.method}
          label="Repayment method"
          options={AllRepaymentMethods}
          optionDisplayMapper={RepaymentMethodToDropdownLabel}
          id="select-payment-method"
          dataCy="select-payment-method"
          setValue={(value: string) => {
            setPayment({
              ...payment,
              method: value as RepaymentMethodEnum,
              requested_payment_date: null,
              settlement_date: null,
            });
          }}
        />
      </Box>
      {payment.method && (
        <>
          <Box mt={4}>
            <Text textVariant={TextVariants.Paragraph} bottomMargin={12}>
              {isReverseDraftACH
                ? "On which date would you like the payment to be withdrawn from your bank account?"
                : "On which date will the payment arrive to the Bespoke bank account?"}
            </Text>
            <Box display="flex" flexDirection="column" mt={1}>
              <DateInput
                id="payment-modal-payment-date-date-picker"
                dataCy="payment-modal-payment-date-date-picker"
                label={
                  isReverseDraftACH ? "Requested Withdraw Date" : "Deposit Date"
                }
                disableNonBankDays
                disabledBefore={disabledBefore}
                value={payment.requested_payment_date}
                onChange={(value) =>
                  setPayment({
                    ...payment,
                    requested_payment_date: value,
                  })
                }
                keyboardIcon={<DateInputIcon width="16px" height="16px" />}
              />
            </Box>
          </Box>
          {!!payment.requested_payment_date && (
            <Box mt={4}>
              <Text textVariant={TextVariants.ParagraphLead} bottomMargin={12}>
                What is my expected settlement date?
              </Text>
              <Text
                textVariant={TextVariants.Paragraph}
                color={SecondaryTextColor}
                bottomMargin={12}
              >
                {`Based on your repayment method and ${
                  isReverseDraftACH
                    ? "requested withdraw date"
                    : "specified deposit date"
                }, this is the expected date when your payment will count towards your balance.`}
              </Text>
              <Box mt={1}>
                <ExpectedDatePreview dateString={payment.settlement_date} />
              </Box>
            </Box>
          )}
        </>
      )}
      {payment.method === RepaymentMethodEnum.ReverseDraftACH && (
        <Box mt={4}>
          <Box>
            <Typography variant="subtitle2">
              Which bank account would you like the payment to be withdrawn
              from?
            </Typography>
          </Box>
          <Box mt={1}>
            <CompanyBank
              companyId={payment.company_id}
              payment={payment}
              onCompanyBankAccountSelection={(id: BankAccounts["id"] | null) =>
                setPayment({ ...payment, company_bank_account_id: id })
              }
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}
