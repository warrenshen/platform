import { Box, Typography } from "@material-ui/core";
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

export default function DebtFacilityOpenTab() {
  const history = useHistory();

  // Get loans currently on the debt facility's books
  const {
    data: debtFacilityData,
    error: debtFacilityError,
  } = useGetOpenLoansByDebtFacilityStatusesSubscription({
    variables: {
      statuses: ["sold_into_debt_facility"],
    },
  });
  if (debtFacilityError) {
    console.error({ debtFacilityError });
    alert(`Error in query (details in console): ${debtFacilityError.message}`);
  }
  const debtFacilityLoans = debtFacilityData?.loans || [];

  // Get loans currently on bespoke's books (or repurchased)
  const {
    data: bespokeData,
    error: bespokeError,
  } = useGetOpenLoansByDebtFacilityStatusesSubscription({
    variables: {
      statuses: ["bespoke_balance_sheet", "repurchased"],
    },
  });
  if (bespokeError) {
    console.error({ bespokeError });
    alert(`Error in query (details in console): ${bespokeError.message}`);
  }
  const bespokeLoans = bespokeData?.loans || [];

  return (
    <Container>
      <Box display="flex" flexDirection="column">
        <Box display="flex" flexDirection="column">
          <Typography variant="h6">Debt Facility Balance Sheet</Typography>
          <DebtFacilityLoansDataGrid
            loans={debtFacilityLoans}
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
        <Box display="flex" flexDirection="column">
          <Typography variant="h6">Bespoke Balance Sheet</Typography>
          <DebtFacilityLoansDataGrid
            loans={bespokeLoans}
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
