import { Box, Button } from "@material-ui/core";
import CreateEbbaApplicationModal from "components/EbbaApplication/CreateEbbaApplicationModal";
import EbbaApplicationCard from "components/EbbaApplication/EbbaApplicationCard";
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

  const { data } = useEbbaApplicationsByCompanyIdQuery({
    variables: {
      companyId,
    },
  });

  const ebbaApplications = data?.ebba_applications || [];

  return (
    <Page appBarTitle={"Borrowing Base"}>
      <Box mt={3}>
        {isCreateEbbaApplicationModalOpen && (
          <CreateEbbaApplicationModal
            handleClose={() => setIsCreateEbbaApplicationModalOpen(false)}
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
        <Box mb={1}>Existing Borrowing Base</Box>
        {ebbaApplications.length > 0 && (
          <EbbaApplicationCard ebbaApplication={ebbaApplications[0]} />
        )}
      </Box>
    </Page>
  );
}

export default CustomerEbbaApplicationsPage;
