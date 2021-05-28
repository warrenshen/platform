import { Box } from "@material-ui/core";
import LoansDataGrid from "components/Loans/LoansDataGrid";
import { useGetLoansForBankSubscription } from "generated/graphql";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  width: 100%;
`;

function BankLoansAllTab() {
  const { data, error } = useGetLoansForBankSubscription();

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const loans = data?.loans || [];

  return (
    <Container>
      <Box display="flex" flexDirection="column">
        <LoansDataGrid
          isArtifactVisible
          isCompanyVisible
          isDisbursementIdentifierVisible
          isExcelExport
          isFilteringEnabled
          isMaturityVisible
          loans={loans}
        />
      </Box>
    </Container>
  );
}

export default BankLoansAllTab;
