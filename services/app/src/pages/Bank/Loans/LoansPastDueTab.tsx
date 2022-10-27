import { Box } from "@material-ui/core";
import BankLoansDataGrid from "components/Loans/BankLoansDataGrid";
import { useGetFundedLoansForBankSubscription } from "generated/graphql";
import { parseDateStringServer } from "lib/date";
import { BankCompanyRouteEnum, getBankCompanyRoute } from "lib/routes";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  width: 100%;
`;

export default function BankLoansPastDueTab() {
  const navigate = useNavigate();

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
        const maturityDate = parseDateStringServer(loan.adjusted_maturity_date);
        return pastDueThreshold > maturityDate;
      }),
    [loans]
  );

  return (
    <Container>
      <Box display="flex" flexDirection="column">
        <BankLoansDataGrid
          isDaysPastDueVisible
          isDisbursementIdentifierVisible
          isMaturityVisible
          isReportingVisible
          loans={pastDueLoans}
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
