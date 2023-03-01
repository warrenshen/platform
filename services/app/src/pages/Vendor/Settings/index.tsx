import VendorSettings from "components/Settings/VendorSettings";
import Page from "components/Shared/Page";
import PageContent from "components/Shared/Page/PageContent";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { useGetCompanyForVendorQuery } from "generated/graphql";
import { useContext } from "react";

const VendorSettingsPage = () => {
  const {
    user: { companyId },
  } = useContext(CurrentUserContext);

  const { data, error } = useGetCompanyForVendorQuery({
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

  return (
    <Page appBarTitle={"Settings"}>
      <PageContent title={"Settings"}>
        {company && <VendorSettings company={company} settings={settings} />}
      </PageContent>
    </Page>
  );
};

export default VendorSettingsPage;
