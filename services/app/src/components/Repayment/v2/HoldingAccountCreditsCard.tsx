import { Box, Checkbox, FormControlLabel } from "@material-ui/core";
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
  isHoldingAccountCreditsChecked: boolean;
  payment: PaymentsInsertInput;
  setIsHoldingAccountCreditsChecked: (value: boolean) => void;
  setPayment: (payment: PaymentsInsertInput) => void;
}

const HoldingAccountCreditsCard = ({
  accountCredits,
  isHoldingAccountCreditsChecked,
  payment,
  setIsHoldingAccountCreditsChecked,
  setPayment,
}: Props) => {
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
            onChange={(event) => {
              setIsHoldingAccountCreditsChecked(event.target.checked);
              setPayment({
                ...payment,
                items_covered: {
                  ...payment.items_covered,
                  requested_from_holding_account: event.target.checked
                    ? payment.items_covered.requested_from_holding_account
                    : 0,
                },
              });
            }}
            color="primary"
            icon={<CustomCheckboxUnchecked />}
            checkedIcon={<CustomCheckboxChecked />}
          />
        }
        label={
          "Do you want to use maximum amount from holding account toward this repayment?"
        }
      />
      <Box mb={2} />
    </CardContainer>
  );
};

export default HoldingAccountCreditsCard;
