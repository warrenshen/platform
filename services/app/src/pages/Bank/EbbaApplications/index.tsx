import EbbaApplicationsDataGrid from "components/EbbaApplications/EbbaApplicationsDataGrid";
import Page from "components/Shared/Page";
import { useEbbaApplicationsQuery } from "generated/graphql";

function EbbaApplicationsPage() {
  const { data, error } = useEbbaApplicationsQuery({});

  if (error) {
    alert("Error querying borrowing bases. " + error);
  }

  const ebbaApplications = data?.ebba_applications || [];

  return (
    <Page appBarTitle={"Borrowing Bases"}>
      <EbbaApplicationsDataGrid
        ebbaApplications={ebbaApplications}
        actionItems={[]}
      ></EbbaApplicationsDataGrid>
    </Page>
  );
}

export default EbbaApplicationsPage;
