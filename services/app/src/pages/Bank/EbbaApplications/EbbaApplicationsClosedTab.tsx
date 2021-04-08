import { Box } from "@material-ui/core";
import EbbaApplicationsDataGrid from "components/EbbaApplications/EbbaApplicationsDataGrid";
import { useGetClosedEbbaApplicationsQuery } from "generated/graphql";

function EbbaApplicationsClosedTab() {
  // Note: we use the fetchPolicy "no-cache" here.
  //
  // The following component tree is rendered.
  // EbbaApplicationsDataGrid >
  // EbbaApplicationDrawerLauncher >
  // EbbaApplicationDrawer >
  // CreateUpdateEbbaApplicationModal
  //
  // When the user updates an EbbaApplication, this updates the Apollo cache
  // and causes ebbaApplications in this component to update. This passes down
  // updated ebbaApplications to the child data grid. Finally, the
  // ControlledDataGrid component currently ALWAYS re-renders on data change,
  // which causes the whole grid to re-render and forcefully close any
  // EbbaApplicationDrawer that is open.

  const { data, error } = useGetClosedEbbaApplicationsQuery({
    fetchPolicy: "no-cache",
  });

  if (error) {
    alert("Error querying borrowing bases. " + error);
  }

  const ebbaApplications = data?.ebba_applications || [];

  return (
    <Box>
      <Box display="flex" flexDirection="row-reverse" mb={2} />
      <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
        <EbbaApplicationsDataGrid
          isExcelExport
          ebbaApplications={ebbaApplications}
        />
      </Box>
    </Box>
  );
}

export default EbbaApplicationsClosedTab;
