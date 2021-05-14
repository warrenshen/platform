import { Box } from "@material-ui/core";
import PartnershipsDataGrid from "components/Partnerships/PartnershipsDataGrid";
import {
  CompanyPartnershipRequests,
  useGetSettledPartnershipRequestsForBankSubscription,
} from "generated/graphql";
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
