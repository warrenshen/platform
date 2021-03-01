import EbbaApplicationsDataGrid from "components/EbbaApplications/EbbaApplicationsDataGrid";
import Page from "components/Shared/Page";
import { useEbbaApplicationsQuery } from "generated/graphql";

function EbbaApplicationsPage() {
  // Note: we use the fetchPolicy "no-cache" here.
  //
  // The following compnent tree is rendered.
  // EbbaApplicationsDataGrid >
  // EbbaApplicationDrawerLauncher >
  // EbbaApplicationDrawer >
  // CreateUpdateEbbaApplicationModal
  //
  // When the user updates an EbbaApplication, this updates the Apollo cache
  // and causes ebbaApplications in this component to update. This passes down
  // updated ebbaApplications to the child data grid. Finally, the key system
  // in ControlledDataGrid does match work correctly, which causes the whole grid
  // to re-render and forcefully close any EbbaApplicationDrawer that is open.
  const { data, error } = useEbbaApplicationsQuery({
    fetchPolicy: "no-cache",
  });

  if (error) {
    alert("Error querying borrowing bases. " + error);
  }

  const ebbaApplications = data?.ebba_applications || [];

  return (
    <Page appBarTitle={"Borrowing Bases"}>
      <EbbaApplicationsDataGrid ebbaApplications={ebbaApplications} />
    </Page>
  );
}

export default EbbaApplicationsPage;
