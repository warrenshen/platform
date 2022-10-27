import { Box } from "@material-ui/core";
import BankLoansDataGrid from "components/Loans/BankLoansDataGrid";
import { useGetLoansForBankSubscription } from "generated/graphql";
import { BankCompanyRouteEnum, getBankCompanyRoute } from "lib/routes";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  width: 100%;
`;

export default function BankLoansAllTab() {
  const navigate = useNavigate();

  const { data, error } = useGetLoansForBankSubscription();

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const loans = data?.loans || [];

  return (
    <Container>
      <Box display="flex" flexDirection="column">
        <BankLoansDataGrid
          isDebtFacilityStatusVisible
          isDisbursementIdentifierVisible
          isMaturityVisible
          isReportingVisible
          loans={loans}
          handleClickCustomer={(customerId) =>
            navigate(
              getBankCompanyRoute(customerId, BankCompanyRouteEnum.Loans)
            )
          }
        />
      </Box>
    </Container>
  );
}
