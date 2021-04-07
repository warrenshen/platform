import { Box } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import CustomerSettings from "components/Settings/CustomerSettings";
import CollectionsBank from "components/Shared/BespokeBankAssignment/CollectionsBank";
import PageContent from "components/Shared/Page/PageContent";
import {
  CompanySettingsFragment,
  ContractFragment,
  useCompanyQuery,
} from "generated/graphql";

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
    <PageContent title={"Settings"}>
      <CustomerSettings
        companyId={companyId}
        company={company}
        settings={settings}
        contract={contract}
        bankAccounts={data?.companies_by_pk?.bank_accounts || []}
        handleDataChange={() => refetch()}
      />
      <Box mt={8} mb={16}>
        <h2>Additional Settings</h2>
        <Alert severity="info">
          Note: the settings below are only visible by bank users (you are a
          bank user).
        </Alert>
        <Box>
          <h4>Bespoke Collections Account</h4>
          <Box display="flex">
            <CollectionsBank
              companySettingsId={settings?.id}
              assignedBespokeBankAccount={
                company.settings?.collections_bespoke_bank_account || undefined
              }
            />
          </Box>
        </Box>
      </Box>
    </PageContent>
  ) : null;
}

export default BankCustomerSettingsSubpage;
