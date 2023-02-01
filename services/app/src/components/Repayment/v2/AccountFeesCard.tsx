import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
} from "@material-ui/core";
import { SecondarySurfaceBackgroundColor } from "components/Shared/Colors/GlobalColors";
import CurrencyInput from "components/Shared/FormInputs/CurrencyInput";
import Text, { TextVariants } from "components/Shared/Text/Text";
import { PaymentsInsertInput } from "generated/graphql";
import { CustomCheckboxChecked, CustomCheckboxUnchecked } from "icons";
import { formatCurrency } from "lib/number";
import { Dispatch, SetStateAction } from "react";
import styled from "styled-components";

const CardContainer = styled.div`
  background-color: ${SecondarySurfaceBackgroundColor};
  border-radius: 4px;
  padding: 32px;
  max-width: 664px;
`;

interface Props {
  accountFees: number;
  payment: PaymentsInsertInput;
  setPayment: (payment: PaymentsInsertInput) => void;
  isPayAccountFeesChecked: boolean;
  setIsPayAccountFeesChecked: Dispatch<SetStateAction<boolean>>;
}

const AccountFeesCard = ({
  accountFees,
  payment,
  setPayment,
  isPayAccountFeesChecked,
  setIsPayAccountFeesChecked,
}: Props) => {
  const error =
    (payment.items_covered?.requested_to_account_fees || 0) > accountFees
      ? `You cannot pay more account fees than you owe: ${formatCurrency(
          accountFees
        )}`
      : undefined;

  return (
    <CardContainer>
      <Text textVariant={TextVariants.SubHeader} bottomMargin={4}>
        {formatCurrency(accountFees)}
      </Text>
      <Text textVariant={TextVariants.Label} bottomMargin={20}>
        {"Accrued account fees"}
      </Text>
      <FormControlLabel
        control={
          <Checkbox
            data-cy={"holding-account-credits-checkbox"}
            checked={isPayAccountFeesChecked}
            onChange={(event) =>
              setIsPayAccountFeesChecked(event.target.checked)
            }
            color="primary"
            icon={<CustomCheckboxUnchecked />}
            checkedIcon={<CustomCheckboxChecked />}
          />
        }
        label={"Do you want to pay account fees"}
      />
      <Box mb={2} />
      {isPayAccountFeesChecked && (
        <FormControl fullWidth>
          <CurrencyInput
            data-cy={"account-fees-textfield"}
            label={"Amount"}
            value={payment.items_covered?.requested_to_account_fees}
            handleChange={(value) =>
              setPayment({
                ...payment,
                items_covered: {
                  ...payment.items_covered,
                  requested_to_account_fees: value,
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

export default AccountFeesCard;
