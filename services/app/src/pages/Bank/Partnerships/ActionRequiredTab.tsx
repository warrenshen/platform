import { Box } from "@material-ui/core";
import DeletePartnershipRequestModal from "components/Partnerships/DeletePartnershipRequestModal";
import HandlePartnershipRequestModal from "components/Partnerships/HandlePartnershipRequestModal";
import PartnershipsDataGrid from "components/Partnerships/PartnershipsDataGrid";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import {
  CompanyPartnershipRequests,
  useGetPartnershipRequestsForBankSubscription,
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

function ActionRequiredTab() {
  const { data, error } = useGetPartnershipRequestsForBankSubscription();

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
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

  return (
    <Container>
      <Box mb={2} display="flex" flexDirection="row-reverse">
        <Can perform={Action.RejectLoan}>
          <Box>
            <ModalButton
              isDisabled={selectedRequestIds.length !== 1}
              label={"Triage Request"}
              modal={({ handleClose }) => (
                <HandlePartnershipRequestModal
                  partnerRequest={selectedRequests[0]}
                  handleClose={() => {
                    handleClose();
                    setSelectedRequestIds([]);
                  }}
                />
              )}
            />
          </Box>
        </Can>
        <Can perform={Action.IsBankAdmin}>
          <Box mr={2}>
            <ModalButton
              isDisabled={selectedRequestIds.length !== 1}
              label={"Delete Request"}
              variant={"outlined"}
              modal={({ handleClose }) => (
                <DeletePartnershipRequestModal
                  partnerRequest={selectedRequests[0]}
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
      <Box display="flex" flexDirection="column">
        <PartnershipsDataGrid
          isClosedTab={false}
          isFilteringEnabled={false}
          isMultiSelectEnabled
          partnershipRequests={partnershipRequests}
          selectedRequestIds={selectedRequestIds}
          handleSelectRequests={handleSelectRequests}
        />
      </Box>
    </Container>
  );
}

export default ActionRequiredTab;
