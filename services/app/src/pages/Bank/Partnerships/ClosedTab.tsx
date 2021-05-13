import { Box } from "@material-ui/core";
import HandlePartnershipRequestModal from "components/Partnerships/HandlePartnershipRequestModal";
import PartnershipsDataGrid from "components/Partnerships/PartnershipsDataGrid";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import {
  CompanyPartnershipRequests,
  useGetAllCompaniesQuery,
  useGetSettledPartnershipRequestsForBankSubscription,
} from "generated/graphql";
import { Action } from "lib/auth/rbac-rules";
import { useMemo, useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  width: 100%;
`;

function ClosedTab() {
  const { data, error } = useGetSettledPartnershipRequestsForBankSubscription();

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const {
    data: companiesData,
    error: companiesError,
  } = useGetAllCompaniesQuery();
  if (companiesError) {
    console.error({ companiesError });
    alert(`Error in query (details in console): ${companiesError.message}`);
  }

  // State for modal(s).
  const [selectedRequestIds, setSelectedRequestIds] = useState<
    CompanyPartnershipRequests["id"]
  >([]);

  const selectedRequests = useMemo(
    () =>
      data?.company_partnership_requests.filter(
        (request) => selectedRequestIds.indexOf(request.id) >= 0
      ) || [],
    [data?.company_partnership_requests, selectedRequestIds]
  );

  const handleSelectRequests = useMemo(
    () => (requests: any[]) => {
      setSelectedRequestIds(requests.map((request) => request.id));
    },
    [setSelectedRequestIds]
  );

  const partnershipRequests = useMemo(
    () => data?.company_partnership_requests || [],
    [data?.company_partnership_requests]
  );

  const allCompanies = useMemo(() => companiesData?.companies || [], [
    companiesData?.companies,
  ]);

  return (
    <Container>
      <Box mb={2} display="flex" flexDirection="row-reverse">
        <Can perform={Action.RejectLoan}>
          <Box mr={2}>
            <ModalButton
              isDisabled={selectedRequestIds.length !== 1}
              label={"Handle Request"}
              modal={({ handleClose }) => (
                <HandlePartnershipRequestModal
                  partnerRequest={selectedRequests[0]}
                  allCompanies={allCompanies}
                  handleClose={() => {
                    handleClose();
                    setSelectedRequestIds([]);
                  }}
                />
              )}
            />
          </Box>
        </Can>
      </Box>
      <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
        <PartnershipsDataGrid
          isExcelExport
          isFilteringEnabled={false}
          partnershipRequests={partnershipRequests}
          selectedRequestIds={selectedRequestIds}
          handleSelectRequests={handleSelectRequests}
          isClosedTab={true}
        />
      </Box>
    </Container>
  );
}

export default ClosedTab;
