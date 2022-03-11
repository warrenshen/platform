import { Box, TextField } from "@material-ui/core";
import DebtFacilityLoansDataGrid from "components/DebtFacility/DebtFacilityLoansDataGrid";
import { useGetOpenLoansByDebtFacilityStatusesSubscription } from "generated/graphql";
import { DebtFacilityStatusEnum } from "lib/enum";
import { BankCompanyRouteEnum, getBankCompanyRoute } from "lib/routes";
import { useHistory } from "react-router-dom";
import styled from "styled-components";
import { useState } from "react";
import { useFilterDebtFacilityLoansBySearchQuery } from "hooks/useFilterDebtFacilityLoans";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  width: 100%;
`;

export default function DebtFacilityAllTab() {
  const history = useHistory();
  const [searchQuery, setSearchQuery] = useState("");

  const { data, error } = useGetOpenLoansByDebtFacilityStatusesSubscription({
    variables: {
      statuses: [
        DebtFacilityStatusEnum.SOLD_INTO_DEBT_FACILITY,
        DebtFacilityStatusEnum.BESPOKE_BALANCE_SHEET,
        DebtFacilityStatusEnum.REPURCHASED,
        DebtFacilityStatusEnum.UPDATE_REQUIRED,
        DebtFacilityStatusEnum.WAIVER,
      ],
    },
  });
  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }
  const loans = useFilterDebtFacilityLoansBySearchQuery(searchQuery, data);

  return (
    <Container>
      <Box display="flex" flexDirection="column">
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-end"
          mb={2}
        >
          <Box display="flex">
            <TextField
              autoFocus
              label="Search by customer name"
              value={searchQuery}
              onChange={({ target: { value } }) => setSearchQuery(value)}
              style={{ width: 400 }}
            />
          </Box>
        </Box>
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
