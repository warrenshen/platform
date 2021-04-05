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
    alert("Error querying purchase order loans. " + error);
  }

  const loans = data?.loans;
  const pastDueLoans = useMemo(
    () =>
      (loans || []).filter((loan) => {
        const pastDueThreshold = new Date(Date.now());
        const maturityDate = new Date(loan.maturity_date);
        return pastDueThreshold > maturityDate;
      }),
    [loans]
  );

  return (
    <Container>
      <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
        <LoansDataGrid
          isCompanyVisible
          isDaysPastDueVisible
          isFilteringEnabled
          isMaturityVisible
          isExcelExport
          loans={pastDueLoans}
        />
      </Box>
    </Container>
  );
}

export default BankLoansPastDueTab;
