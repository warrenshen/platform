import { Box, TextField } from "@material-ui/core";
import DebtFacilityLoansDataGrid from "components/DebtFacility/DebtFacilityLoansDataGrid";
import { LoanFragment, LoanReportFragment } from "generated/graphql";
import { BankCompanyRouteEnum, getBankCompanyRoute } from "lib/routes";
import { useHistory } from "react-router-dom";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  width: 100%;
`;

type Loan = LoanReportFragment & LoanFragment;

interface Props {
  loans: Loan[];
  searchQuery: string;
  setSearchQuery: (newQuery: string) => void;
}

export default function DebtFacilityActionRequiredTab({
  loans,
  searchQuery,
  setSearchQuery,
}: Props) {
  const history = useHistory();

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
