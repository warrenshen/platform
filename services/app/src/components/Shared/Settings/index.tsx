import { Box, Button } from "@material-ui/core";
import BankAccounts from "components/Shared/CompanyProfile/BankAccounts";
import CreateEbbaApplicationModal from "components/Shared/EbbaApplication/CreateEbbaApplicationModal";
import AccountSettingsCard from "components/Shared/Settings/AccountSettingsCard";
import EditAccountSettings from "components/Shared/Settings/EditAccountSettings";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  BankAccountFragment,
  CompanySettingsForCustomerFragment,
  CompanySettingsFragment,
  ProductTypeEnum,
} from "generated/graphql";
import useAppBarTitle from "hooks/useAppBarTitle";
import React, { useContext, useState } from "react";
import { useTitle } from "react-use";

interface Props {
  settings: CompanySettingsFragment | CompanySettingsForCustomerFragment;
  bankAccounts: BankAccountFragment[];
}

function Settings(props: Props) {
  useTitle("Settings | Bespoke");
  useAppBarTitle("Settings");

  const {
    user: { productType },
  } = useContext(CurrentUserContext);

  const settings = props.settings;
  const [accountSettingsOpen, setAccountSettingsOpen] = useState(false);

  const [
    isCreateEbbaApplicationModalOpen,
    setIsCreateEbbaApplicationModalOpen,
  ] = useState(false);

  return (
    <div>
      <BankAccounts
        companyId={settings.company_id}
        bankAccounts={props.bankAccounts}
      ></BankAccounts>
      <Box>
        <h3>Account Settings</h3>
        {accountSettingsOpen && (
          <EditAccountSettings
            settings={settings}
            onClose={() => {
              setAccountSettingsOpen(false);
            }}
          ></EditAccountSettings>
        )}
        <AccountSettingsCard
          settings={settings}
          onClick={() => {
            setAccountSettingsOpen(true);
          }}
        ></AccountSettingsCard>
      </Box>
      {productType === ProductTypeEnum.LineOfCredit && (
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
            Create Ebba Application
          </Button>
        </Box>
      )}
    </div>
  );
}

export default Settings;
