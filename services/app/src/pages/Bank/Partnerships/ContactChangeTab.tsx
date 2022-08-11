import { Box } from "@material-ui/core";
import DeleteVendorChangeRequestModal from "components/Partnerships/DeleteVendorChangeRequestModal";
import HandleVendorChangeRequestModal from "components/Partnerships/HandleVendorChangeRequestModal";
import PartnershipChangeRequestDataGrid from "components/Partnerships/PartnershipChangeRequestDataGrid";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import {
  VendorChangeRequests,
  useGetPartnershipChangeRequestsForBankSubscription,
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

function ContactChangeTab() {
  const { data, error } = useGetPartnershipChangeRequestsForBankSubscription();

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const [selectedRequestIds, setSelectedRequestIds] = useState<
    VendorChangeRequests["id"]
  >([]);

  const selectedRequests = useMemo(
    () =>
      data?.vendor_change_requests.filter(
        (request) => selectedRequestIds.indexOf(request.id) >= 0
      ) || [],
    [data?.vendor_change_requests, selectedRequestIds]
  );

  const handleSelectRequests = useMemo(
    () => (requests: any[]) => {
      setSelectedRequestIds(requests.map((request) => request.id));
    },
    [setSelectedRequestIds]
  );

  const partnershipRequests = useMemo(
    () => data?.vendor_change_requests || [],
    [data?.vendor_change_requests]
  );

  const triageRequestModal = (handleClose: () => void) => {
    return (
      <HandleVendorChangeRequestModal
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
              isDisabled={selectedRequestIds.length !== 1}
              label={"Triage Request"}
              modal={({ handleClose }) => triageRequestModal(handleClose)}
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
                <DeleteVendorChangeRequestModal
                  vendorChangeRequest={selectedRequests[0]}
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
        <PartnershipChangeRequestDataGrid
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

export default ContactChangeTab;
