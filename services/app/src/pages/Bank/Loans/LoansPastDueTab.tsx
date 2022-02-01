import { Box } from "@material-ui/core";
import LoansDataGrid from "components/Loans/LoansDataGrid";
import { useGetFundedLoansForBankSubscription } from "generated/graphql";
import { BankCompanyRouteEnum, getBankCompanyRoute } from "lib/routes";
import { useMemo } from "react";
import { useHistory } from "react-router-dom";
import styled from "styled-components";
import { PartnerEnum } from "lib/enum";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  width: 100%;
`;

export default function BankLoansPastDueTab() {
  const history = useHistory();

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
          isReportingVisible
          partnerType={PartnerEnum.BOTH}
          loans={pastDueLoans}
          handleClickCustomer={(customerId) =>
            history.push(
              getBankCompanyRoute(customerId, BankCompanyRouteEnum.Loans)
            )
          }
        />
      </Box>
    </Container>
  );
}
