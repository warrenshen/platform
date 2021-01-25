import { Box } from "@material-ui/core";
import BankAccounts from "components/Shared/CompanyProfile/BankAccounts";
import AccountSettingsCard from "components/Shared/Settings/AccountSettingsCard";
import EditAccountSettings from "components/Shared/Settings/EditAccountSettings";
import {
  BankAccountFragment,
  CompanySettingsForCustomerFragment,
  CompanySettingsFragment,
} from "generated/graphql";
import useAppBarTitle from "hooks/useAppBarTitle";
import { useState } from "react";
import { useTitle } from "react-use";

interface Props {
  settings: CompanySettingsFragment | CompanySettingsForCustomerFragment;
  bankAccounts: BankAccountFragment[];
}

function Settings(props: Props) {
  useTitle("Settings | Bespoke");
  useAppBarTitle("Settings");

  const settings = props.settings;
  const [accountSettingsOpen, setAccountSettingsOpen] = useState(false);

  // TODO(dlluncor): Need to limit a customer from editing their account settings
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
    </div>
  );
}

export default Settings;
