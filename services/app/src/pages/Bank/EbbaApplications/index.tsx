import EbbaApplicationsDataGrid from "components/Bank/EbbaApplications/EbbaApplicationsDataGrid";
import Page from "components/Shared/Page";
import { useEbbaApplicationsQuery } from "generated/graphql";
import useAppBarTitle from "hooks/useAppBarTitle";
import { useTitle } from "react-use";

function EbbaApplicationsPage() {
  useTitle("Borrowing Bases | Bespoke");
  useAppBarTitle("Borrowing Bases");

  const { data, error } = useEbbaApplicationsQuery({});

  if (error) {
    alert("Error querying borrowing bases. " + error);
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
