import { Box } from "@material-ui/core";
import AddAccountButton from "components/BankAccount/AddAccountButton";
import BankAccountInfoCard from "components/BankAccount/BankAccountInfoCard";
import CompanySettingsCard from "components/Settings/CompanySettingsCard";
import EditAccountSettingsModal from "components/Settings/EditCompanySettingsModal";
import CompanyInfo from "components/Shared/CompanyProfile/CompanyInfo";
import {
  BankAccountFragment,
  CompanyFragment,
  CompanySettingsForCustomerFragment,
  CompanySettingsFragment,
  ContractFragment,
} from "generated/graphql";
import React, { useState } from "react";

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
  const [accountSettingsOpen, setAccountSettingsOpen] = useState(false);

  return (
    <div>
      <Box>
        <h2>Account Settings</h2>
        <Box>
          <h3>Customer Settings</h3>
          <Box mt={3}>
            <CompanyInfo company={company} />
          </Box>
          <Box mt={3}>
            {accountSettingsOpen && (
              <EditAccountSettingsModal
                companyId={companyId}
                existingSettings={settings}
                existingContract={contract}
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
          <AddAccountButton companyId={settings.company_id} />
          <Box display="flex" mt={3}>
            {bankAccounts.map((bankAccount, index) => (
              <Box mr={2} key={index}>
                <BankAccountInfoCard bankAccount={bankAccount} />
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </div>
  );
}

export default Settings;
