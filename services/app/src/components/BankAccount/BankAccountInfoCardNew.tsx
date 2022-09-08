import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Checkbox,
} from "@material-ui/core";
import CreateUpdateBankAccountModal from "components/BankAccount/CreateUpdateBankAccountModal";
import ModalButton from "components/Shared/Modal/ModalButton";
import {
  BankAccountForVendorFragment,
  BankAccountFragment,
  BankAccountLimitedFragment,
} from "generated/graphql";
import { formatDateString } from "lib/date";
import { obfuscateBankNumbers } from "lib/privacy";
import { useState } from "react";
import styled from "styled-components";

const Label = styled.div`
  width: 174px;
  color: #abaaa9;
`;

const StyledCardContent = styled(CardContent)`
  padding: 0px;
`;

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

const BankAccountInfoCardNew = ({
  isCannabisCompliantVisible = false,
  isEditAllowed = false,
  isTemplateNameVisible = false,
  isVerificationVisible = false,
  bankAccount,
  handleDataChange,
}: Props) => {
  const [isObfuscateEnabled, setIsObfuscateEnabled] = useState(true);

  return (
    <Card>
      <StyledCardContent>
        <Box display="flex" mb={1} mt={1}>
          <Label>Bank Name</Label>
          <Box>{bankAccount.bank_name}</Box>
        </Box>
        <Box display="flex" mb={1}>
          <Label>Account Name</Label>
          <Box>{bankAccount.account_title}</Box>
        </Box>
        <Box display="flex" mb={1}>
          <Label>Account Type</Label>
          <Box>{bankAccount.account_type}</Box>
        </Box>
        <Box display="flex" mb={1}>
          <Label>Account Number</Label>
          <Box>
            {isObfuscateEnabled
              ? obfuscateBankNumbers(bankAccount.account_number)
              : bankAccount.account_number}
          </Box>
        </Box>
        <Box display="flex" alignItems="center" pt={0.5} pb={1}>
          <StyledCheckbox
            checked={(bankAccount as BankAccountFragment).can_wire}
            icon={<CustomCheckboxUnchecked />}
            checkedIcon={<CustomCheckboxChecked />}
          />
          <Box pl={1}>{"ACH"}</Box>
        </Box>
        {!!(bankAccount as BankAccountFragment).can_ach && (
          <Box display="flex" flexDirection="column">
            <Box display="flex" mb={1}>
              <Label>ACH Routing Number</Label>
              <Box>
                {isObfuscateEnabled && !!bankAccount?.routing_number
                  ? obfuscateBankNumbers(bankAccount.routing_number)
                  : bankAccount.routing_number}
              </Box>
            </Box>
            <Box display="flex" mb={1}>
              <Label>ACH Default Memo</Label>
              <Box>{(bankAccount as BankAccountFragment).ach_default_memo}</Box>
            </Box>
          </Box>
        )}
        <Box display="flex" alignItems="center" pt={0.5} pb={1}>
          <StyledCheckbox
            checked={(bankAccount as BankAccountFragment).can_wire}
            icon={<CustomCheckboxUnchecked />}
            checkedIcon={<CustomCheckboxChecked />}
          />
          <Box pl={1}>{"Wire?"}</Box>
        </Box>
        {!!(bankAccount as BankAccountFragment).can_wire && (
          <Box display="flex" flexDirection="column">
            <Box display="flex" alignItems="center" pt={0.5} pb={1}>
              <StyledCheckbox
                checked={
                  (bankAccount as BankAccountFragment)
                    .is_wire_intermediary as boolean
                }
                icon={<CustomCheckboxUnchecked />}
                checkedIcon={<CustomCheckboxChecked />}
              />
              <Box pl={1}>{"Is intermediary bank?"}</Box>
            </Box>
            {!!(bankAccount as BankAccountFragment).is_wire_intermediary && (
              <Box display="flex" flexDirection="column">
                <Box display="flex" mb={1}>
                  <Label>Intermediary Bank Name</Label>
                  <Box>
                    {
                      (bankAccount as BankAccountFragment)
                        .intermediary_bank_name
                    }
                  </Box>
                </Box>
                <Box display="flex" mb={1}>
                  <Label>Intermediary Bank Address</Label>
                  <Box>
                    {
                      (bankAccount as BankAccountFragment)
                        .intermediary_bank_address
                    }
                  </Box>
                </Box>
                <Box display="flex" mb={1}>
                  <Label>Intermediary Account Name</Label>
                  <Box>
                    {
                      (bankAccount as BankAccountFragment)
                        .intermediary_account_name
                    }
                  </Box>
                </Box>
                <Box display="flex" mb={1}>
                  <Label>Intermediary Account Number</Label>
                  <Box>
                    {isObfuscateEnabled
                      ? obfuscateBankNumbers(
                          bankAccount.intermediary_account_number || ""
                        )
                      : bankAccount.intermediary_account_number}
                  </Box>
                </Box>
              </Box>
            )}
            <Box display="flex" mb={1}>
              <Label>Wire Routing Number</Label>
              <Box>
                {isObfuscateEnabled
                  ? obfuscateBankNumbers(bankAccount.wire_routing_number || "")
                  : bankAccount.wire_routing_number}
              </Box>
            </Box>
            <Box display="flex" mb={1}>
              <Label>Recipient Address</Label>
              <Box>
                {(bankAccount as BankAccountFragment).recipient_address}
              </Box>
            </Box>
            <Box display="flex" mb={1}>
              <Label>Recipient Address 2</Label>
              <Box>
                {(bankAccount as BankAccountFragment).recipient_address_2}
              </Box>
            </Box>
            <Box display="flex" mb={1}>
              <Label>Wire Default Memo</Label>
              <Box>
                {(bankAccount as BankAccountFragment).wire_default_memo}
              </Box>
            </Box>
          </Box>
        )}
        {isCannabisCompliantVisible && (
          <Box display="flex" alignItems="center" pt={0.5} pb={1}>
            <StyledCheckbox
              checked={
                (bankAccount as BankAccountFragment).is_cannabis_compliant
              }
              icon={<CustomCheckboxUnchecked />}
              checkedIcon={<CustomCheckboxChecked />}
            />
            <Box pl={1}>{"Is cannabis compliant?"}</Box>
          </Box>
        )}
        {isVerificationVisible && (
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
        )}
        <Box display="flex" pt={0.5}>
          <Button
            color="default"
            size="small"
            variant="outlined"
            onClick={() => setIsObfuscateEnabled(!isObfuscateEnabled)}
          >
            {isObfuscateEnabled ? "Reveal Numbers" : "Hide Numbers"}
          </Button>
        </Box>
      </StyledCardContent>
      {isEditAllowed && (
        <CardActions>
          <ModalButton
            label={"Edit"}
            color="default"
            size="small"
            variant="outlined"
            modal={({ handleClose }) => (
              <CreateUpdateBankAccountModal
                companyId={bankAccount.company_id}
                existingBankAccount={bankAccount as BankAccountFragment}
                handleClose={() => {
                  !!handleDataChange && handleDataChange();
                  handleClose();
                }}
              />
            )}
          />
        </CardActions>
      )}
    </Card>
  );
};

export default BankAccountInfoCardNew;
