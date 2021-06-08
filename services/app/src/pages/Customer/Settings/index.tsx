import CustomerSettings from "components/Settings/CustomerSettings";
import Page from "components/Shared/Page";
import PageContent from "components/Shared/Page/PageContent";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  CompanySettingsLimitedFragment,
  ContractFragment,
  useCompanyForCustomerQuery,
} from "generated/graphql";
import { useContext } from "react";

function SettingsPage() {
  const {
    user: { companyId },
  } = useContext(CurrentUserContext);

  const { data, refetch } = useCompanyForCustomerQuery({
    fetchPolicy: "network-only",
    variables: {
      companyId,
    },
  });

  const company = data?.companies_by_pk;
  const settings = data?.companies_by_pk
    ?.settings as CompanySettingsLimitedFragment;
  const contract = data?.companies_by_pk?.contract as ContractFragment;

  return (
    <Page appBarTitle={"Settings"}>
      <PageContent title={"Settings"}>
        {company && (
          <CustomerSettings
            companyId={companyId}
            company={company}
            settings={settings}
            contract={contract}
            bankAccounts={data?.companies_by_pk?.bank_accounts || []}
            handleDataChange={() => refetch()}
          />
        )}
      </PageContent>
    </Page>
  );
}

export default SettingsPage;
