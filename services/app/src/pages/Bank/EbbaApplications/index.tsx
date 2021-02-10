import EbbaApplicationsDataGrid from "components/Bank/EbbaApplications/EbbaApplicationsDataGrid";
import Page from "components/Shared/Page";
import { useEbbaApplicationsQuery } from "generated/graphql";
import useAppBarTitle from "hooks/useAppBarTitle";
import { useTitle } from "react-use";

function EbbaApplicationsPage() {
  useTitle("EBBA Applications | Bespoke");
  useAppBarTitle("EBBA Applications");

  const { data, error } = useEbbaApplicationsQuery({});

  if (error) {
    alert("Error querying EBBA applications. " + error);
  }

  const ebbaApplications = data?.ebba_applications || [];

  return (
    <Page>
      <EbbaApplicationsDataGrid
        ebbaApplications={ebbaApplications}
        actionItems={[]}
      ></EbbaApplicationsDataGrid>
    </Page>
  );
}

export default EbbaApplicationsPage;
