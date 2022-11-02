import { Box, Checkbox } from "@material-ui/core";
import CardLine from "components/Shared/Card/CardLine";
import {
  BankAccountForVendorFragment,
  BankAccountFragment,
  BankAccountLimitedFragment,
} from "generated/graphql";
import { formatDateString } from "lib/date";
import styled from "styled-components";

const StyledCheckbox = styled(Checkbox)`
  padding: 4px;
`;

const CustomCheckboxUnchecked = styled.span`
  background-color: #e5e4e1;
  border: 1px solid #d4d3d0;
  border-radius: 4px;
  height: 16px;
  width: 16px;
`;

const CustomCheckboxChecked = styled(CustomCheckboxUnchecked)`
  border: 1px solid #abaaa9;
  background-color: #abaaa9;
  background-image: url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M12 5c-.28 0-.53.11-.71.29L7 9.59l-2.29-2.3a1.003 1.003 0 00-1.42 1.42l3 3c.18.18.43.29.71.29s.53-.11.71-.29l5-5A1.003 1.003 0 0012 5z' fill='%23fff'/%3E%3C/svg%3E\");
`;

interface Props {
  isCannabisCompliantVisible?: boolean;
  isEditAllowed?: boolean;
  isTemplateNameVisible?: boolean;
  isVerificationVisible?: boolean;
  bankAccount:
    | BankAccountFragment
    | BankAccountLimitedFragment
    | BankAccountForVendorFragment;
  handleDataChange?: () => void;
}

const BankAccountInfoCardContent = ({
  isCannabisCompliantVisible = false,
  isEditAllowed = false,
  isTemplateNameVisible = false,
  isVerificationVisible = false,
  bankAccount,
  handleDataChange,
}: Props) => {
  const castedBankAccount = bankAccount as BankAccountFragment;

  return (
    <Box>
      <CardLine
        labelText={"Bank Name"}
        valueText={bankAccount.bank_name}
        valueAlignment={"left"}
      />
      <CardLine
        labelText={"Account Name"}
        valueText={bankAccount.account_title || ""}
        valueAlignment={"left"}
      />
      <CardLine
        labelText={"Account Type"}
        valueText={bankAccount.account_type}
        valueAlignment={"left"}
      />
      <CardLine
        isValueObfuscated
        labelText={"Account Number"}
        valueText={bankAccount.account_number}
        valueAlignment={"left"}
      />
      <Box display="flex" alignItems="center" pt={0.5} pb={1}>
        <StyledCheckbox
          disabled
          checked={castedBankAccount.can_ach}
          icon={<CustomCheckboxUnchecked />}
          checkedIcon={<CustomCheckboxChecked />}
        />
        <Box pl={1}>{"ACH"}</Box>
      </Box>
      {castedBankAccount.can_ach && (
        <CardLine
          isValueObfuscated
          labelText={"ACH Routing Number"}
          valueText={bankAccount.routing_number || ""}
          valueAlignment={"left"}
        />
      )}
      <Box display="flex" alignItems="center" pt={0.5} pb={1}>
        <StyledCheckbox
          checked={castedBankAccount.can_wire}
          icon={<CustomCheckboxUnchecked />}
          checkedIcon={<CustomCheckboxChecked />}
        />
        <Box pl={1}>{"Wire?"}</Box>
      </Box>
      {castedBankAccount.can_wire && (
        <>
          <Box display="flex" alignItems="center" pt={0.5} pb={1}>
            <StyledCheckbox
              checked={castedBankAccount.is_wire_intermediary as boolean}
              icon={<CustomCheckboxUnchecked />}
              checkedIcon={<CustomCheckboxChecked />}
            />
            <Box pl={1}>{"Is intermediary bank?"}</Box>
          </Box>
          {castedBankAccount.is_wire_intermediary && (
            <>
              <CardLine
                labelText={"Intermediary Bank Name"}
                valueText={bankAccount.intermediary_bank_name || ""}
                valueAlignment={"left"}
              />
              <CardLine
                labelText={"Intermediary Bank Address"}
                valueText={bankAccount.intermediary_bank_address || ""}
                valueAlignment={"left"}
              />
              <CardLine
                labelText={"Intermediary Account Name"}
                valueText={bankAccount.intermediary_account_name || ""}
                valueAlignment={"left"}
              />
              <CardLine
                labelText={"Intermediary Account Number"}
                valueText={bankAccount.intermediary_account_number || ""}
                valueAlignment={"left"}
              />
            </>
          )}
          <CardLine
            isValueObfuscated
            labelText={"Wire Routing Number"}
            valueText={bankAccount.wire_routing_number || ""}
            valueAlignment={"left"}
          />
          <CardLine
            labelText={"Recipient Address"}
            valueText={bankAccount.recipient_address || ""}
            valueAlignment={"left"}
          />
          <CardLine
            labelText={"Recipient Address 2"}
            valueText={bankAccount.recipient_address_2 || ""}
            valueAlignment={"left"}
          />
        </>
      )}
      {isCannabisCompliantVisible && (
        <Box display="flex" alignItems="center" pt={0.5} pb={1}>
          <StyledCheckbox
            checked={(bankAccount as BankAccountFragment).is_cannabis_compliant}
            icon={<CustomCheckboxUnchecked />}
            checkedIcon={<CustomCheckboxChecked />}
          />
          <Box pl={1}>{"Is cannabis compliant?"}</Box>
        </Box>
      )}
      <Box display="flex" alignItems="center" pt={0.5} pb={1}>
        <StyledCheckbox
          checked={
            (bankAccount as BankAccountFragment).verified_at &&
            (bankAccount as BankAccountFragment).verified_date
          }
          icon={<CustomCheckboxUnchecked />}
          checkedIcon={<CustomCheckboxChecked />}
        />
        <Box pl={1}>
          {(bankAccount as BankAccountFragment).verified_at &&
          (bankAccount as BankAccountFragment).verified_date
            ? `Verified on ${formatDateString(
                (bankAccount as BankAccountFragment).verified_date
              )}`
            : "Not yet verified"}
        </Box>
      </Box>
    </Box>
  );
};

export default BankAccountInfoCardContent;
