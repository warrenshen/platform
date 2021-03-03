import { Box } from "@material-ui/core";
import BankLoansDataGrid from "components/Loans/BankLoansDataGrid";
import Page from "components/Shared/Page";
import { useGetFundedLoansForBankSubscription } from "generated/graphql";
import { useMemo } from "react";

function LoansPastDuePage() {
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
    <Page appBarTitle={"Loans Past Due"}>
      <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
        <BankLoansDataGrid
          isDaysPastDueVisible
          isFilteringEnabled
          isMaturityVisible
          loans={pastDueLoans}
        />
      </Box>
    </Page>
  );
}

export default LoansPastDuePage;
