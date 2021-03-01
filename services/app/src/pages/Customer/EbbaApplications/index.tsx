import { Box, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import CreateUpdateEbbaApplicationModal from "components/EbbaApplication/CreateUpdateEbbaApplicationModal";
import EbbaApplicationCard from "components/EbbaApplication/EbbaApplicationCard";
import EbbaApplicationsDataGrid from "components/EbbaApplications/EbbaApplicationsDataGrid";
import ModalButton from "components/Shared/Modal/ModalButton";
import Page from "components/Shared/Page";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { useGetCompanyForCustomerBorrowingBaseQuery } from "generated/graphql";
import { ActionType } from "lib/enum";
import { useContext } from "react";

function CustomerEbbaApplicationsPage() {
  const {
    user: { companyId },
  } = useContext(CurrentUserContext);

  const { data, refetch } = useGetCompanyForCustomerBorrowingBaseQuery({
    variables: {
      companyId,
    },
  });

  const activeEbbaApplication =
    data?.companies_by_pk?.settings?.active_ebba_application;
  const ebbaApplications = data?.companies_by_pk?.ebba_applications || [];

  const isActiveApplicationValid = activeEbbaApplication;

  return (
    <Page appBarTitle={"Borrowing Base"}>
      <Box>
        <Typography variant="h6">
          Review your current borrowing base, submit a new financial
          certification, and view historical certifications.
        </Typography>
        <Typography variant="subtitle1">
          Your borrowing base determines the total amount in loans you may
          request from Bespoke. Bespoke calculates your borrowing base based on
          financial information you provide (ex. AR, inventory, cash) on a
          regular basis.
        </Typography>
      </Box>
      <Box mt={2}>
        <ModalButton
          label={"Create Borrowing Base Certification"}
          modal={({ handleClose }) => (
            <CreateUpdateEbbaApplicationModal
              actionType={ActionType.New}
              ebbaApplicationId={null}
              handleClose={() => {
                refetch();
                handleClose();
              }}
            />
          )}
        />
      </Box>
      <Box mt={3}>
        <Box>
          <Box mb={1}>
            <Typography variant="h6">
              Active Borrowing Base Certification
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" mt={1} mb={2}>
            {isActiveApplicationValid ? (
              <Alert severity="info" style={{ alignSelf: "flex-start" }}>
                <Box maxWidth={600}>
                  Your current borrowing base certification is up-to-date. You
                  can review its details below.
                </Box>
              </Alert>
            ) : (
              <Alert severity="warning" style={{ alignSelf: "flex-start" }}>
                <Box maxWidth={600}>
                  You do not have an up-to-date borrowing base certification.
                  Please submit a new borrowing base certification for approval
                  to establish your borrowing base. Otherwise, you will not be
                  able to request new loans.
                </Box>
              </Alert>
            )}
          </Box>
          {isActiveApplicationValid && activeEbbaApplication && (
            <EbbaApplicationCard ebbaApplication={activeEbbaApplication} />
          )}
        </Box>
        <Box mt={3}>
          <Box mb={1}>
            <Typography variant="h6">
              Historical Borrowing Base Certifications
            </Typography>
          </Box>
          <EbbaApplicationsDataGrid
            isCompanyVisible={false}
            ebbaApplications={ebbaApplications}
          />
        </Box>
      </Box>
    </Page>
  );
}

export default CustomerEbbaApplicationsPage;
