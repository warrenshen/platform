import { Box } from "@material-ui/core";
import LoansDataGrid from "components/Loans/LoansDataGrid";
import { useGetFundedLoansForBankSubscription } from "generated/graphql";
import { useMemo } from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  width: 100%;
`;

function BankLoansPastDueTab() {
  const { data, error } = useGetFundedLoansForBankSubscription();

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const loans = data?.loans;
  const pastDueLoans = useMemo(
    () =>
      (loans || []).filter((loan) => {
        const pastDueThreshold = new Date(Date.now());
        const maturityDate = new Date(loan.adjusted_maturity_date);
        return pastDueThreshold > maturityDate;
      }),
    [loans]
  );

  return (
    <Container>
      <Box display="flex" flexDirection="column">
        <LoansDataGrid
          isArtifactVisible
          isCompanyVisible
          isDaysPastDueVisible
          isDisbursementIdentifierVisible
          isFilteringEnabled
          isMaturityVisible
          loans={pastDueLoans}
        />
      </Box>
    </Container>
  );
}

export default BankLoansPastDueTab;
