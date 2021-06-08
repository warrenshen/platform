import { Box } from "@material-ui/core";
import LoansDataGrid from "components/Loans/LoansDataGrid";
import { useGetLoansForBankSubscription } from "generated/graphql";
import { useHistory } from "react-router-dom";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  width: 100%;
`;

export default function BankLoansAllTab() {
  const history = useHistory();

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
          isFilteringEnabled
          isMaturityVisible
          loans={loans}
          handleClickCustomer={(customerId) =>
            history.push(`/customers/${customerId}/loans`)
          }
        />
      </Box>
    </Container>
  );
}
