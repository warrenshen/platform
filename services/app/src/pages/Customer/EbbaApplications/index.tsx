import { Box, Button, Typography } from "@material-ui/core";
import CreateEbbaApplicationModal from "components/EbbaApplication/CreateEbbaApplicationModal";
import EbbaApplicationCard from "components/EbbaApplication/EbbaApplicationCard";
import EbbaApplicationsDataGrid from "components/EbbaApplications/EbbaApplicationsDataGrid";
import Page from "components/Shared/Page";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { useGetCompanyForCustomerBorrowingBaseQuery } from "generated/graphql";
import React, { useContext, useState } from "react";

function CustomerEbbaApplicationsPage() {
  const {
    user: { companyId },
  } = useContext(CurrentUserContext);

  const [
    isCreateEbbaApplicationModalOpen,
    setIsCreateEbbaApplicationModalOpen,
  ] = useState(false);

  const { data, refetch } = useGetCompanyForCustomerBorrowingBaseQuery({
    variables: {
      companyId,
    },
  });

  const contract = data?.companies_by_pk?.contract || null;
  const activeEbbaApplication =
    data?.companies_by_pk?.settings?.active_ebba_application;
  const ebbaApplications = data?.companies_by_pk?.ebba_applications || [];

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
          {activeEbbaApplication ? (
            <EbbaApplicationCard
              ebbaApplication={activeEbbaApplication}
              contract={contract}
            />
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
