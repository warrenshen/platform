import { Box } from "@material-ui/core";
import AdvancesBank from "components/Shared/BespokeBankAssignment/AdvancesBank";
import CollectionsBank from "components/Shared/BespokeBankAssignment/CollectionsBank";
import Can from "components/Shared/Can";
import Settings from "components/Shared/Settings";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  CompanySettingsFragment,
  ContractFragment,
  useCompanyQuery,
} from "generated/graphql";
import { Action } from "lib/auth/rbac-rules";
import { useContext } from "react";
import { useParams } from "react-router-dom";

export interface CustomerParams {
  companyId: string;
}

function SettingsPage() {
  const { companyId: companyIdFromParams } = useParams<CustomerParams>();
  const { user } = useContext(CurrentUserContext);
  const companyId = companyIdFromParams || user.companyId;

  const { data } = useCompanyQuery({
    variables: {
      companyId,
    },
  });

  if (!data || !data?.companies_by_pk) {
    return null;
  }

  const settings = data?.companies_by_pk?.settings as CompanySettingsFragment;
  const contract = data?.companies_by_pk?.contract as ContractFragment;

  return (
    <>
      <Settings
        companyId={companyId}
        settings={settings}
        contract={contract}
        bankAccounts={data?.companies_by_pk?.bank_accounts || []}
      ></Settings>
      <Can perform={Action.AssignBespokeBankAccountForCustomer}>
        <h3>Collection and Advances Accounts</h3>
        <Box mt={2} display="flex">
          <AdvancesBank
            companySettingsId={settings?.id}
            assignedBespokeBankAccount={
              data.companies_by_pk?.settings?.advances_bespoke_bank_account ||
              undefined
            }
          ></AdvancesBank>
          <CollectionsBank
            companySettingsId={settings?.id}
            assignedBespokeBankAccount={
              data.companies_by_pk?.settings
                ?.collections_bespoke_bank_account || undefined
            }
          ></CollectionsBank>
        </Box>
      </Can>
    </>
  );
}

export default SettingsPage;
