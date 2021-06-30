import CustomerSettings from "components/Settings/CustomerSettings";
import Page from "components/Shared/Page";
import PageContent from "components/Shared/Page/PageContent";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  ContractFragment,
  useGetCompanyForCustomerQuery,
} from "generated/graphql";
import { useContext } from "react";

export default function SettingsPage() {
  const {
    user: { companyId },
  } = useContext(CurrentUserContext);

  const { data, error, refetch } = useGetCompanyForCustomerQuery({
    fetchPolicy: "network-only",
    variables: {
      companyId,
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const company = data?.companies_by_pk;
  const settings = data?.companies_by_pk?.settings;
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
