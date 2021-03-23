import Settings from "components/Settings";
import Page from "components/Shared/Page";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  CompanySettingsForCustomerFragment,
  ContractFragment,
  useCompanyForCustomerQuery,
} from "generated/graphql";
import { useContext } from "react";

function SettingsPage() {
  const {
    user: { companyId },
  } = useContext(CurrentUserContext);

  const { data, refetch } = useCompanyForCustomerQuery({
    variables: {
      companyId,
    },
  });

  if (!data || !data?.companies_by_pk) {
    return null;
  }

  const company = data?.companies_by_pk;
  const settings = data?.companies_by_pk
    ?.settings as CompanySettingsForCustomerFragment;
  const contract = data?.companies_by_pk?.contract as ContractFragment;

  return (
    <Page appBarTitle={"Settings"}>
      {company && (
        <Settings
          companyId={companyId}
          company={company}
          settings={settings}
          contract={contract}
          bankAccounts={data?.companies_by_pk?.bank_accounts || []}
          handleDataChange={() => refetch()}
        />
      )}
    </Page>
  );
}

export default SettingsPage;
