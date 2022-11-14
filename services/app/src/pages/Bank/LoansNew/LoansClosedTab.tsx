import { Box } from "@material-ui/core";
import BankLoansDataGrid from "components/Loans/BankLoansDataGrid";
import Text, { TextVariants } from "components/Shared/Text/Text";
import { useGetClosedLoansForBankSubscription } from "generated/graphql";
import { BankCompanyRouteEnum, getBankCompanyRoute } from "lib/routes";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  width: 100%;
`;

export default function BankLoansClosedTab() {
  const navigate = useNavigate();

  const { data, error } = useGetClosedLoansForBankSubscription();

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const loans = data?.loans || [];

  return (
    <Container>
      <Text textVariant={TextVariants.ParagraphLead}>Closed</Text>
      <Box display="flex" flexDirection="column">
        <BankLoansDataGrid
          isArtifactBankNoteVisible
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
