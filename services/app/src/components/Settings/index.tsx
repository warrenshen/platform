import { Box } from "@material-ui/core";
import AddAccountButton from "components/BankAccount/AddAccountButton";
import BankAccountInfoCard from "components/BankAccount/BankAccountInfoCard";
import CompanySettingsCard from "components/Settings/CompanySettingsCard";
import EditCompanySettingsModal from "components/Settings/EditCompanySettingsModal";
import Can from "components/Shared/Can";
import CompanyInfo from "components/Shared/CompanyProfile/CompanyInfo";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  BankAccountFragment,
  CompanyFragment,
  CompanySettingsForCustomerFragment,
  CompanySettingsFragment,
  ContractFragment,
} from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
import React, { useContext, useState } from "react";

interface Props {
  companyId: string;
  company: CompanyFragment;
  settings: CompanySettingsFragment | CompanySettingsForCustomerFragment;
  contract: ContractFragment | null;
  bankAccounts: BankAccountFragment[];
  handleDataChange: () => void;
}

function Settings({
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
    <div>
      <Box>
        <h2>Account Settings</h2>
        <Box>
          <h3>Customer Settings</h3>
          <Box mt={3}>
            <CompanyInfo
              company={company}
              isEditAllowed={check(role, Action.EditBankAccount)}
            />
          </Box>
          <Box mt={3}>
            {accountSettingsOpen && (
              <EditCompanySettingsModal
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
        <Box>
          <h3>Bank Accounts</h3>
          <Can perform={Action.AddBankAccount}>
            <AddAccountButton companyId={settings.company_id} />
          </Can>
          <Box display="flex" mt={3}>
            {bankAccounts.map((bankAccount, index) => (
              <Box mr={2} key={index}>
                <BankAccountInfoCard
                  bankAccount={bankAccount}
                  isEditAllowed={check(role, Action.EditBankAccount)}
                />
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </div>
  );
}

export default Settings;
