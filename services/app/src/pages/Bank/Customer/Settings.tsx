import { Box } from "@material-ui/core";
import Settings from "components/Settings";
import AdvancesBank from "components/Shared/BespokeBankAssignment/AdvancesBank";
import CollectionsBank from "components/Shared/BespokeBankAssignment/CollectionsBank";
import Can from "components/Shared/Can";
import {
  CompanySettingsFragment,
  ContractFragment,
  useCompanyQuery,
} from "generated/graphql";
import { Action } from "lib/auth/rbac-rules";

export interface CustomerParams {
  companyId: string;
}

interface Props {
  companyId: string;
}

function BankCustomerSettingsSubpage({ companyId }: Props) {
  const { data, refetch } = useCompanyQuery({
    variables: {
      companyId,
    },
  });

  const company = data?.companies_by_pk;
  const settings = data?.companies_by_pk?.settings as CompanySettingsFragment;
  const contract = data?.companies_by_pk?.contract as ContractFragment;

  return company ? (
    <>
      <Settings
        companyId={companyId}
        company={company}
        settings={settings}
        contract={contract}
        bankAccounts={data?.companies_by_pk?.bank_accounts || []}
        handleDataChange={() => refetch()}
      />
      <Can perform={Action.AssignBespokeBankAccountForCustomer}>
        <Box mt={2}>
          <h2>Bespoke Collection and Advances Accounts</h2>
          <Box display="flex">
            <AdvancesBank
              companySettingsId={settings?.id}
              assignedBespokeBankAccount={
                company.settings?.advances_bespoke_bank_account || undefined
              }
            />
            <CollectionsBank
              companySettingsId={settings?.id}
              assignedBespokeBankAccount={
                company.settings?.collections_bespoke_bank_account || undefined
              }
            />
          </Box>
        </Box>
      </Can>
    </>
  ) : null;
}

export default BankCustomerSettingsSubpage;
