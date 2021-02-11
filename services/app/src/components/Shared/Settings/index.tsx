import { Box, Button } from "@material-ui/core";
import AddAccountButton from "components/Shared/BankAccount/AddAccountButton";
import BankAccountInfoCard from "components/Shared/BankAccount/BankAccountInfoCard";
import CreateEbbaApplicationModal from "components/Shared/EbbaApplication/CreateEbbaApplicationModal";
import EbbaApplicationCard from "components/Shared/EbbaApplication/EbbaApplicationCard";
import CompanySettingsCard from "components/Shared/Settings/CompanySettingsCard";
import ContractSettingsCard from "components/Shared/Settings/ContractSettingsCard";
import ContractTermsModal from "components/Shared/Settings/ContractTermsModal";
import EditAccountSettingsModal from "components/Shared/Settings/EditCompanySettingsModal";
import {
  BankAccountFragment,
  CompanySettingsForCustomerFragment,
  CompanySettingsFragment,
  ContractFragment,
  ProductTypeEnum,
  useEbbaApplicationsByCompanyIdQuery,
} from "generated/graphql";
import useAppBarTitle from "hooks/useAppBarTitle";
import React, { useState } from "react";
import { useTitle } from "react-use";

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
  useTitle("Settings | Bespoke");
  useAppBarTitle("Settings");

  const [accountSettingsOpen, setAccountSettingsOpen] = useState(false);
  const [
    isEditContractTermsModalOpen,
    setIsEditContractTermsModalOpen,
  ] = useState(false);

  const [
    isCreateEbbaApplicationModalOpen,
    setIsCreateEbbaApplicationModalOpen,
  ] = useState(false);

  const { data } = useEbbaApplicationsByCompanyIdQuery({
    variables: {
      companyId,
    },
  });

  const ebbaApplications = data?.ebba_applications || [];

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
              ></EditAccountSettingsModal>
            )}
            <CompanySettingsCard
              contract={contract}
              settings={settings}
              handleClick={() => {
                setAccountSettingsOpen(true);
              }}
            ></CompanySettingsCard>
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
                ></ContractTermsModal>
              )}
              <ContractSettingsCard
                contract={contract}
                handleClick={() => setIsEditContractTermsModalOpen(true)}
              ></ContractSettingsCard>
            </Box>
          )}
        </Box>
        <Box>
          <h3>Bank Accounts</h3>
          <AddAccountButton companyId={settings.company_id}></AddAccountButton>
          <Box display="flex" mt={3}>
            {bankAccounts.map((bankAccount, index) => (
              <Box mr={2} key={index}>
                <BankAccountInfoCard
                  bankAccount={bankAccount}
                ></BankAccountInfoCard>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
      {contract?.product_type === ProductTypeEnum.LineOfCredit && (
        <>
          <h2>Line of Credit Settings</h2>
          <Box>
            <h3>Borrowing Base</h3>
            <Box mt={3}>
              {isCreateEbbaApplicationModalOpen && (
                <CreateEbbaApplicationModal
                  handleClose={() => setIsCreateEbbaApplicationModalOpen(false)}
                ></CreateEbbaApplicationModal>
              )}
              <Button
                onClick={() => setIsCreateEbbaApplicationModalOpen(true)}
                variant="contained"
                color="primary"
              >
                Create Borrowing Base
              </Button>
            </Box>
            <Box mt={3}>
              <Box mb={1}>Existing Borrowing Base</Box>
              {ebbaApplications.length > 0 && (
                <EbbaApplicationCard
                  ebbaApplication={ebbaApplications[0]}
                ></EbbaApplicationCard>
              )}
            </Box>
          </Box>
        </>
      )}
    </div>
  );
}

export default Settings;
