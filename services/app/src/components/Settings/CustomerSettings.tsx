import { Box, Typography } from "@material-ui/core";
import BankAccountInfoCard from "components/BankAccount/BankAccountInfoCard";
import CreateUpdateBankAccountModal from "components/BankAccount/CreateUpdateBankAccountModal";
import CompanySettingsCard from "components/Settings/CompanySettingsCard";
import EditCustomerSettingsModal from "components/Settings/EditCustomerSettingsModal";
import ManageUsersArea from "components/Settings/ManageUsersArea";
import Can from "components/Shared/Can";
import CompanyInfo from "components/Shared/CompanyProfile/CompanyInfo";
import ModalButton from "components/Shared/Modal/ModalButton";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  BankAccountFragment,
  CompanyFragment,
  CompanySettingsFragment,
  CompanySettingsLimitedFragment,
  ContractFragment,
} from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
import { useContext, useState } from "react";

interface Props {
  companyId: string;
  company: CompanyFragment;
  settings: CompanySettingsFragment | CompanySettingsLimitedFragment;
  contract: ContractFragment | null;
  bankAccounts: BankAccountFragment[];
  handleDataChange: () => void;
}

export default function CustomerSettings({
  companyId,
  company,
  settings,
  contract,
  bankAccounts,
  handleDataChange,
}: Props) {
  const {
    user: { role },
  } = useContext(CurrentUserContext);

  const [accountSettingsOpen, setAccountSettingsOpen] = useState(false);

  return (
    <Box>
      <Box>
        <h2>General</h2>
        <Box mt={3}>
          <CompanyInfo
            isEditAllowed={check(role, Action.EditBankAccount)}
            company={company}
            handleDataChange={handleDataChange}
          />
        </Box>
        <Box mt={3}>
          {accountSettingsOpen && (
            <EditCustomerSettingsModal
              contract={contract}
              companyId={companyId}
              existingSettings={settings}
              handleClose={() => {
                handleDataChange();
                setAccountSettingsOpen(false);
              }}
            />
          )}
          <CompanySettingsCard
            contract={contract}
            settings={settings}
            handleClick={() => {
              setAccountSettingsOpen(true);
            }}
          />
        </Box>
      </Box>
      <Box mt={4}>
        <h2>Bank Accounts</h2>
        <Can perform={Action.AddBankAccount}>
          <ModalButton
            label={"Add Bank Account"}
            modal={({ handleClose }) => (
              <CreateUpdateBankAccountModal
                companyId={companyId}
                existingBankAccount={null}
                handleClose={() => {
                  handleDataChange();
                  handleClose();
                }}
              />
            )}
          />
        </Can>
        <Box display="flex" mt={3}>
          {bankAccounts.length > 0 ? (
            bankAccounts.map((bankAccount, index) => (
              <Box mr={2} key={index}>
                <BankAccountInfoCard
                  isCannabisCompliantVisible
                  isEditAllowed={check(role, Action.EditBankAccount)}
                  isVerificationVisible
                  bankAccount={bankAccount}
                />
              </Box>
            ))
          ) : (
            <Typography variant="body2">No bank accounts set up yet</Typography>
          )}
        </Box>
      </Box>
      <Box mt={4}>
        <ManageUsersArea companyId={companyId}></ManageUsersArea>
      </Box>
    </Box>
  );
}
