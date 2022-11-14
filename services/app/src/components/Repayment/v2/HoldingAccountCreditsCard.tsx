import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
} from "@material-ui/core";
import CurrencyInput from "components/Shared/FormInputs/CurrencyInput";
import Text, { TextVariants } from "components/Shared/Text/Text";
import { PaymentsInsertInput } from "generated/graphql";
import { CustomCheckboxChecked, CustomCheckboxUnchecked } from "icons";
import { formatCurrency } from "lib/number";
import styled from "styled-components";

const CardContainer = styled.div`
  background-color: #fcf6ea;
  border-radius: 4px;
  padding: 32px;
  max-width: 664px;
`;

interface Props {
  accountCredits: number;
  payment: PaymentsInsertInput;
  setPayment: (payment: PaymentsInsertInput) => void;
  isHoldingAccountCreditsChecked: boolean;
  setIsHoldingAccountCreditsChecked: (value: boolean) => void;
}

const HoldingAccountCreditsCard = ({
  accountCredits,
  payment,
  setPayment,
  isHoldingAccountCreditsChecked,
  setIsHoldingAccountCreditsChecked,
}: Props) => {
  const error =
    (payment.items_covered?.requested_from_holding_account || 0) >
    accountCredits
      ? `You cannot use more credits than you have: ${formatCurrency(
          accountCredits
        )}`
      : payment.requested_amount <
          payment.items_covered?.requested_from_holding_account || 0
      ? `You cannot request to use more credits from holding account than the amount you are paying: ${formatCurrency(
          payment.requested_amount
        )}`
      : undefined;

  return (
    <CardContainer>
      <Text textVariant={TextVariants.SubHeader} bottomMargin={4}>
        {formatCurrency(accountCredits)}
      </Text>
      <Text textVariant={TextVariants.Label} bottomMargin={20}>
        {"Holding account credits"}
      </Text>
      <FormControlLabel
        control={
          <Checkbox
            data-cy={"holding-account-credits-checkbox"}
            checked={isHoldingAccountCreditsChecked}
            onChange={(event) =>
              setIsHoldingAccountCreditsChecked(event.target.checked)
            }
            color="primary"
            icon={<CustomCheckboxUnchecked />}
            checkedIcon={<CustomCheckboxChecked />}
          />
        }
        label={
          "Do you want to use holding account credits as a part of the repayment?"
        }
      />
      <Box mb={2} />
      {isHoldingAccountCreditsChecked && (
        <FormControl fullWidth>
          <CurrencyInput
            data-cy={"holding-account-credits-textfield"}
            label={`Holding account credits (max. ${formatCurrency(
              accountCredits
            )})`}
            value={payment.items_covered?.requested_from_holding_account}
            handleChange={(value) =>
              setPayment({
                ...payment,
                items_covered: {
                  ...payment.items_covered,
                  requested_from_holding_account: value,
                },
              })
            }
            error={error}
          />
        </FormControl>
      )}
    </CardContainer>
  );
};

export default HoldingAccountCreditsCard;
