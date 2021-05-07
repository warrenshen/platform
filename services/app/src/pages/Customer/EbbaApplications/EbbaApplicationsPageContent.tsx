import { Box, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import CreateUpdateEbbaApplicationModal from "components/EbbaApplication/CreateUpdateEbbaApplicationModal";
import EbbaApplicationCard from "components/EbbaApplication/EbbaApplicationCard";
import EbbaApplicationsDataGrid from "components/EbbaApplications/EbbaApplicationsDataGrid";
import ModalButton from "components/Shared/Modal/ModalButton";
import PageContent from "components/Shared/Page/PageContent";
import {
  Companies,
  useGetCompanyForCustomerBorrowingBaseQuery,
} from "generated/graphql";
import { withinNDaysOfNowOrBefore } from "lib/date";
import { ActionType } from "lib/enum";

interface Props {
  companyId: Companies["id"];
}

export default function CustomerEbbaApplicationsPageContent({
  companyId,
}: Props) {
  const { data, loading, refetch } = useGetCompanyForCustomerBorrowingBaseQuery(
    {
      fetchPolicy: "network-only",
      variables: {
        companyId,
      },
    }
  );

  const activeEbbaApplication =
    data?.companies_by_pk?.settings?.active_ebba_application;
  const ebbaApplications = data?.companies_by_pk?.ebba_applications || [];

  const isActiveApplicationValid = !!activeEbbaApplication;
  const isActiveApplicationExpiringSoon = withinNDaysOfNowOrBefore(
    activeEbbaApplication?.expires_at,
    15
  );

  return (
    <PageContent
      title={"Borrowing Base"}
      subtitle={
        "Review your current borrowing base, submit a new certification, and view historical certifications."
      }
    >
      <Box mt={2}>
        <ModalButton
          label={"Create Borrowing Base Certification"}
          modal={({ handleClose }) => (
            <CreateUpdateEbbaApplicationModal
              actionType={ActionType.New}
              companyId={companyId}
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
            <Box width="50%">
              <Typography variant="body2">
                Your active borrowing base certification determines your max
                borrowing limit with Bespoke Financial. The financial
                information you provide is used to calculate your max borrowing
                limit.
              </Typography>
            </Box>
          </Box>
          <Box display="flex" flexDirection="column" mt={1} mb={2}>
            {!loading &&
              (isActiveApplicationValid ? (
                !isActiveApplicationExpiringSoon ? (
                  <Alert severity="info" style={{ alignSelf: "flex-start" }}>
                    <Box maxWidth={600}>
                      Your current borrowing base certification is up-to-date.
                      You can review its details below.
                    </Box>
                  </Alert>
                ) : (
                  <Alert severity="warning" style={{ alignSelf: "flex-start" }}>
                    <Box maxWidth={600}>
                      Your current borrowing base certification is expiring
                      soon. Please submit a new certification.
                    </Box>
                  </Alert>
                )
              ) : (
                <Alert severity="warning" style={{ alignSelf: "flex-start" }}>
                  <Box maxWidth={600}>
                    You do not have an up-to-date borrowing base certification.
                    Please submit a new borrowing base certification for
                    approval to establish your borrowing base. Otherwise, you
                    will not be able to request new loans.
                  </Box>
                </Alert>
              ))}
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
    </PageContent>
  );
}
