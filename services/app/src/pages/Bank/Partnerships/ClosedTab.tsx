import { Box } from "@material-ui/core";
import PartnershipsDataGrid from "components/Partnerships/PartnershipsDataGrid";
import { useGetSettledPartnershipRequestsForBankSubscription } from "generated/graphql";
import { useMemo } from "react";
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

  const partnershipRequests = useMemo(
    () => data?.company_partnership_requests || [],
    [data?.company_partnership_requests]
  );

  return (
    <Container>
      <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
        <PartnershipsDataGrid
          isClosedTab
          isExcelExport
          isFilteringEnabled={false}
          partnershipRequests={partnershipRequests}
        />
      </Box>
    </Container>
  );
}

export default ClosedTab;
