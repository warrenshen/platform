import { Box } from "@material-ui/core";
import BankAccounts from "components/Shared/CompanyProfile/BankAccounts";
import useAppBarTitle from "hooks/useAppBarTitle";
import { useTitle } from "react-use";
import {
  BankAccountFragment,
  CompanySettingsForCustomerFragment,
  CompanySettingsFragment,
} from "../../../generated/graphql";

interface Props {
  settings: CompanySettingsFragment | CompanySettingsForCustomerFragment;
  bankAccounts: BankAccountFragment[];
}

function Settings(props: Props) {
  useTitle("Settings | Bespoke");
  useAppBarTitle("Settings");

  const settings = props.settings;

  return (
    <div>
      <BankAccounts
        companyId={settings.company_id}
        bankAccounts={props.bankAccounts}
      ></BankAccounts>
      <Box>
        <h3>Account</h3>
      </Box>
    </div>
  );
}

export default Settings;
