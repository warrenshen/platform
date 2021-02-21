import { Box, Button, Typography } from "@material-ui/core";
import CreateEbbaApplicationModal from "components/EbbaApplication/CreateEbbaApplicationModal";
import EbbaApplicationCard from "components/EbbaApplication/EbbaApplicationCard";
import EbbaApplicationsDataGrid from "components/EbbaApplications/EbbaApplicationsDataGrid";
import Page from "components/Shared/Page";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { useEbbaApplicationsByCompanyIdQuery } from "generated/graphql";
import React, { useContext, useState } from "react";

function CustomerEbbaApplicationsPage() {
  const {
    user: { companyId },
  } = useContext(CurrentUserContext);

  const [
    isCreateEbbaApplicationModalOpen,
    setIsCreateEbbaApplicationModalOpen,
  ] = useState(false);

  const { data, refetch } = useEbbaApplicationsByCompanyIdQuery({
    variables: {
      companyId,
    },
  });

  const ebbaApplications = data?.ebba_applications || [];

  return (
    <Page appBarTitle={"Borrowing Base"}>
      <Box mt={2}>
        {isCreateEbbaApplicationModalOpen && (
          <CreateEbbaApplicationModal
            handleClose={() => {
              refetch();
              setIsCreateEbbaApplicationModalOpen(false);
            }}
          />
        )}
        <Button
          onClick={() => setIsCreateEbbaApplicationModalOpen(true)}
          variant="contained"
          color="primary"
        >
          Create Borrowing Base Certification
        </Button>
      </Box>
      <Box mt={3}>
        <Box>
          <Box mb={1}>
            <Typography variant="h6">Active Borrowing Base</Typography>
          </Box>
          {ebbaApplications.length > 0 ? (
            <EbbaApplicationCard ebbaApplication={ebbaApplications[0]} />
          ) : (
            <Box>
              <Typography variant="body2">No active borrowing base</Typography>
            </Box>
          )}
        </Box>
        <Box mt={3}>
          <Box mb={1}>
            <Typography variant="h6">Historical Borrowing Base</Typography>
          </Box>
          <EbbaApplicationsDataGrid
            isCompanyVisible={false}
            ebbaApplications={ebbaApplications}
            actionItems={[]}
          />
        </Box>
      </Box>
    </Page>
  );
}

export default CustomerEbbaApplicationsPage;
