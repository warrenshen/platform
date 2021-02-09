import { Box, Button } from "@material-ui/core";
import BankAccounts from "components/Shared/CompanyProfile/BankAccounts";
import CreateEbbaApplicationModal from "components/Shared/EbbaApplication/CreateEbbaApplicationModal";
import EbbaApplicationCard from "components/Shared/EbbaApplication/EbbaApplicationCard";
import AccountSettingsCard from "components/Shared/Settings/AccountSettingsCard";
import EditAccountSettings from "components/Shared/Settings/EditAccountSettings";
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
  contract: ContractFragment;
  bankAccounts: BankAccountFragment[];
}

function Settings(props: Props) {
  useTitle("Settings | Bespoke");
  useAppBarTitle("Settings");

  const settings = props.settings;
  const contract = props.contract;
  const [accountSettingsOpen, setAccountSettingsOpen] = useState(false);

  const [
    isCreateEbbaApplicationModalOpen,
    setIsCreateEbbaApplicationModalOpen,
  ] = useState(false);

  const { data } = useEbbaApplicationsByCompanyIdQuery({
    variables: {
      companyId: props.companyId,
    },
  });

  const ebbaApplications = data?.ebba_applications || [];

  return (
    <div>
      <Box>
        <h2>Account Settings</h2>
        <Box>
          {accountSettingsOpen && (
            <EditAccountSettings
              companyId={props.companyId}
              settings={settings}
              contract={contract}
              onClose={() => {
                setAccountSettingsOpen(false);
              }}
            ></EditAccountSettings>
          )}
          <AccountSettingsCard
            settings={settings}
            contract={contract}
            onClick={() => {
              setAccountSettingsOpen(true);
            }}
          ></AccountSettingsCard>
        </Box>
        <BankAccounts
          companyId={settings.company_id}
          bankAccounts={props.bankAccounts}
        ></BankAccounts>
      </Box>
      {contract?.product_type === ProductTypeEnum.LineOfCredit && (
        <Box mt={3}>
          <h2>Line of Credit Settings</h2>
          <h3>Eligible Borrowing Base Amount Applications</h3>
          <Box>
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
              Create Ebba Application
            </Button>
          </Box>
          <Box mt={3}>
            <Box mb={1}>Existing EBBA Application</Box>
            {ebbaApplications.length > 0 && (
              <EbbaApplicationCard
                ebbaApplication={ebbaApplications[0]}
              ></EbbaApplicationCard>
            )}
          </Box>
        </Box>
      )}
    </div>
  );
}

export default Settings;
