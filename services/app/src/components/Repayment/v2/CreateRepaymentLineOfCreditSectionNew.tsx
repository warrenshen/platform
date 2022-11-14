import { Box, Divider, FormControl } from "@material-ui/core";
import CurrencyInput from "components/Shared/FormInputs/CurrencyInput";
import SelectDropdown from "components/Shared/FormInputs/SelectDropdown";
import Text, { TextVariants } from "components/Shared/Text/Text";
import {
  FinancialSummaryFragment,
  PaymentsInsertInput,
} from "generated/graphql";
import { Dispatch, SetStateAction } from "react";

import HoldingAccountCreditsCard from "./HoldingAccountCreditsCard";
import RepaymentModalInfoCard from "./RepaymentModalInfoCard";

interface Props {
  financialSummary: FinancialSummaryFragment | null;
  payment: PaymentsInsertInput;
  setPayment: (payment: PaymentsInsertInput) => void;
  accountFeeTotal: number;
  payEntireBalance: boolean;
  setPayEntireBalance: Dispatch<SetStateAction<boolean>>;
  isHoldingAccountCreditsChecked: boolean;
  setIsHoldingAccountCreditsChecked: Dispatch<SetStateAction<boolean>>;
}

export default function CreateRepaymentLineofCreditSection({
  financialSummary,
  payment,
  setPayment,
  accountFeeTotal,
  payEntireBalance,
  setPayEntireBalance,
  isHoldingAccountCreditsChecked,
  setIsHoldingAccountCreditsChecked,
}: Props) {
  const customAmountCovered = payment.requested_amount;

  const amountLeftoverForAccountFees =
    payment.requested_amount -
    ((financialSummary?.total_outstanding_principal || 0) +
      (financialSummary?.total_outstanding_interest || 0));

  return (
    <>
      <RepaymentModalInfoCard
        outstandingPrincipal={
          financialSummary ? financialSummary.total_outstanding_principal : 0
        }
        outstandingInterest={
          financialSummary ? financialSummary.total_outstanding_interest : 0
        }
        outstandingAccountFees={accountFeeTotal}
      />
      <Box my={6}>
        <Divider light />
      </Box>
      <Box>
        <Box mb={2}>
          <Text textVariant={TextVariants.ParagraphLead}>
            How much do you want to pay?
          </Text>
          <SelectDropdown
            value={
              payEntireBalance ? "Pay entire balance" : "Pay custom amount"
            }
            label="Payment option"
            options={["Pay entire balance", "Pay custom amount"]}
            id="payment-option-dropdown"
            setValue={(value) => {
              if (value === "Pay entire balance") {
                setPayEntireBalance(true);
              } else {
                setPayEntireBalance(false);
              }
            }}
          />
        </Box>
        {!payEntireBalance && (
          <FormControl fullWidth>
            <CurrencyInput
              label={"Custom amount"}
              value={customAmountCovered}
              handleChange={(value) => {
                setPayment({
                  ...payment,
                  requested_amount: value,
                  items_covered: {
                    ...payment.items_covered,
                    requested_to_account_fees:
                      amountLeftoverForAccountFees > 0
                        ? amountLeftoverForAccountFees
                        : 0,
                  },
                });
              }}
            />
          </FormControl>
        )}
      </Box>
      <Box my={6}>
        <Divider light />
      </Box>
      <Box>
        <Text textVariant={TextVariants.ParagraphLead}>
          How do you want to pay?
        </Text>

        <HoldingAccountCreditsCard
          accountCredits={
            financialSummary
              ? financialSummary.account_level_balance_payload?.credits_total
              : 0
          }
          payment={payment}
          setPayment={setPayment}
          isHoldingAccountCreditsChecked={isHoldingAccountCreditsChecked}
          setIsHoldingAccountCreditsChecked={setIsHoldingAccountCreditsChecked}
        />
      </Box>
    </>
  );
}
