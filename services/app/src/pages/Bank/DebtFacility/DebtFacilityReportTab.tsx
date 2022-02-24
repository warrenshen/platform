import { Box } from "@material-ui/core";
import DebtFacilityReportDataGrid from "components/DebtFacility/DebtFacilityReportDataGrid";
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

export default function DebtFacilityReportTab() {
  const history = useHistory();

  const { data, error } = useGetOpenLoansByDebtFacilityStatusesSubscription({
    variables: {
      statuses: [
        "sold_into_debt_facility",
        "bespoke_balance_sheet",
        "repurchased",
        "update_required",
        "waiver",
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
          <DebtFacilityReportDataGrid
            loans={loans}
            isCompanyVisible
            isStatusVisible
            isMaturityVisible
            isReportingVisible
            isDisbursementIdentifierVisible
            isDaysPastDueVisible
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
