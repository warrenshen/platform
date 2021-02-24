import { Box } from "@material-ui/core";
import AddAccountButton from "components/BankAccount/AddAccountButton";
import BankAccountInfoCard from "components/BankAccount/BankAccountInfoCard";
import ContractSettingsCard from "components/Contract/ContractCard";
import ContractTermsModal from "components/Contract/ContractTermsModal";
import CompanySettingsCard from "components/Settings/CompanySettingsCard";
import EditAccountSettingsModal from "components/Settings/EditCompanySettingsModal";
import {
  BankAccountFragment,
  CompanySettingsForCustomerFragment,
  CompanySettingsFragment,
  ContractFragment,
} from "generated/graphql";
import React, { useState } from "react";

interface Props {
  companyId: string;
  settings: CompanySettingsFragment | CompanySettingsForCustomerFragment;
  contract: ContractFragment | null;
  bankAccounts: BankAccountFragment[];
  handleDataChange: () => void;
}

function Settings({
  companyId,
  settings,
  contract,
  bankAccounts,
  handleDataChange,
}: Props) {
  const [accountSettingsOpen, setAccountSettingsOpen] = useState(false);
  const [
    isEditContractTermsModalOpen,
    setIsEditContractTermsModalOpen,
  ] = useState(false);

  return (
    <div>
      <Box>
        <h2>Account Settings</h2>
        <Box>
          <h3>Customer Settings</h3>
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
          <h3>Contract</h3>
          {contract && (
            <Box mt={3}>
              {isEditContractTermsModalOpen && (
                <ContractTermsModal
                  isViewOnly={false}
                  onClose={() => {
                    handleDataChange();
                    setIsEditContractTermsModalOpen(false);
                  }}
                  contractId={contract.id}
                />
              )}
              <ContractSettingsCard
                contract={contract}
                handleClick={() => setIsEditContractTermsModalOpen(true)}
              />
            </Box>
          )}
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
