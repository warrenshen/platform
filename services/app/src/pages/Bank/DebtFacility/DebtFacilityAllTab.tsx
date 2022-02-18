import { Box } from "@material-ui/core";
import DebtFacilityLoansDataGrid from "components/DebtFacility/DebtFacilityLoansDataGrid";
import { useGetOpenLoansByDebtFacilityStatusesSubscription } from "generated/graphql";
import { BankCompanyRouteEnum, getBankCompanyRoute } from "lib/routes";
import { useHistory } from "react-router-dom";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  width: 100%;
`;

export default function DebtFacilityAllTab() {
  const history = useHistory();

  const { data, error } = useGetOpenLoansByDebtFacilityStatusesSubscription({
    variables: {
      statuses: [
        "sold_into_debt_facility",
        "bespoke_balance_sheet",
        "repurchased",
        "update_required",
      ],
    },
  });
  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }
  const loans = data?.loans || [];

  return (
    <Container>
      <Box display="flex" flexDirection="column">
        <Box display="flex" flexDirection="column">
          <DebtFacilityLoansDataGrid
            loans={loans}
            isCompanyVisible={true}
            isStatusVisible={true}
            isMaturityVisible={true}
            isDisbursementIdentifierVisible={true}
            handleClickCustomer={(customerId) =>
              history.push(
                getBankCompanyRoute(customerId, BankCompanyRouteEnum.Loans)
              )
            }
          />
        </Box>
      </Box>
    </Container>
  );
}
