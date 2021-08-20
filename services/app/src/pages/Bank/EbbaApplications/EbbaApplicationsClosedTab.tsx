import { Box } from "@material-ui/core";
import EbbaApplicationsDataGrid from "components/EbbaApplications/EbbaApplicationsDataGrid";
import { useGetClosedEbbaApplicationsQuery } from "generated/graphql";

export default function EbbaApplicationsClosedTab() {
  const { data, error } = useGetClosedEbbaApplicationsQuery({
    fetchPolicy: "network-only",
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const ebbaApplications = data?.ebba_applications || [];

  return (
    <Box>
      <Box display="flex" flexDirection="row-reverse" mb={2} />
      <Box display="flex" flexDirection="column">
        <EbbaApplicationsDataGrid
          isApprovedAtVisible
          isCompanyVisible
          isLineOfCredit
          ebbaApplications={ebbaApplications}
        />
      </Box>
    </Box>
  );
}
