import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
} from "@material-ui/core";
import CurrencyInput from "components/Shared/FormInputs/CurrencyInput";
import Text, { TextVariants } from "components/Shared/Text/Text";
import { CustomCheckboxChecked, CustomCheckboxUnchecked } from "icons";
import { formatCurrency } from "lib/number";
import { useState } from "react";
import styled from "styled-components";

const CardContainer = styled.div`
  background-color: #fcf6ea;
  border-radius: 4px;
  padding: 32px;
  max-width: 664px;
`;

interface Props {
  accountCredits: number;
  setHoldingAccountCredits: (value: any) => void;
}

const HoldingAccountCreditsCard = ({
  accountCredits,
  setHoldingAccountCredits,
}: Props) => {
  const [isHoldingAccountCreditsChecked, setIsHoldingAccountCreditsChecked] =
    useState(false);

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
            value={accountCredits}
            handleChange={setHoldingAccountCredits}
          />
        </FormControl>
      )}
    </CardContainer>
  );
};

export default HoldingAccountCreditsCard;
