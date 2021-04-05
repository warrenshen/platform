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
    alert("Error querying loans. " + error);
  }

  const loans = data?.loans || [];

  return (
    <Container>
      <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
        <LoansDataGrid
          isExcelExport
          isCompanyVisible
          isFilteringEnabled
          isMaturityVisible
          loans={loans}
        />
      </Box>
    </Container>
  );
}

export default BankLoansAllTab;
