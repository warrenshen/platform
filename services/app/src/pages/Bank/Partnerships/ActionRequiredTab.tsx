import { Box } from "@material-ui/core";
import DeletePartnershipRequestModal from "components/Partnerships/DeletePartnershipRequestModal";
import EditPartnershipRequestModal from "components/Partnerships/EditPartnershipRequestModal";
import HandlePartnershipRequestPayorModal from "components/Partnerships/HandlePartnershipRequestModal";
import HandlePartnershipRequestVendorModal from "components/Partnerships/HandlePartnershipRequestNewModal";
import PartnershipsDataGrid from "components/Partnerships/PartnershipsDataGrid";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import {
  CompanyPartnershipRequests,
  CompanyTypeEnum,
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

  const triageRequestModal = (handleClose: () => void) => {
    return selectedRequests[0]?.company_type === CompanyTypeEnum.Vendor ? (
      <HandlePartnershipRequestVendorModal
        partnerRequest={selectedRequests[0]}
        handleClose={() => {
          handleClose();
          setSelectedRequestIds([]);
        }}
      />
    ) : (
      <HandlePartnershipRequestPayorModal
        partnerRequest={selectedRequests[0]}
        handleClose={() => {
          handleClose();
          setSelectedRequestIds([]);
        }}
      />
    );
  };

  return (
    <Container>
      <Box mb={2} display="flex" flexDirection="row-reverse">
        <Can perform={Action.RejectLoan}>
          <Box>
            <ModalButton
              dataCy={"triage-request-button"}
              isDisabled={selectedRequestIds.length !== 1}
              label={"Triage Request"}
              modal={({ handleClose }) => triageRequestModal(handleClose)}
            />
          </Box>
        </Can>
        <Can perform={Action.IsBankAdmin}>
          <Box mr={2}>
            <ModalButton
              dataCy={"edit-request-button"}
              isDisabled={selectedRequestIds.length !== 1}
              label={"Edit Request"}
              variant={"outlined"}
              modal={({ handleClose }) => (
                <EditPartnershipRequestModal
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
              dataCy={"delete-request-button"}
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
      <Box
        data-cy="partnership-data-grid-container"
        display="flex"
        flexDirection="column"
      >
        <PartnershipsDataGrid
          isClosedTab={false}
          isFilteringEnabled
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
