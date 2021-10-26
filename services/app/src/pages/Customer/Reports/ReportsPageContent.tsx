import { Box, Typography } from "@material-ui/core";
import PageContent from "components/Shared/Page/PageContent";
import { useGetAllLoansForCompanyQuery } from "generated/graphql";
import ReportLoansDataGrid from "components/Reports/ReportLoansDataGrid";
import { isLoanComingOrPastDue } from "lib/date";

interface Props {
  companyId: string;
}

export default function CustomerReportsPageContent({ companyId }: Props) {
  const { data: loansData, error: loansError } = useGetAllLoansForCompanyQuery({
    skip: !companyId,
    fetchPolicy: "network-only",
    variables: {
      companyId,
    },
  });

  if (loansError) {
    console.error({ error: loansError });
    alert(`Error in query (details in console): ${loansError.message}`);
  }

  const loans = loansData?.loans || [];

  const comingDueLoans = loans.filter((loan) => {
    const isComingDue = isLoanComingOrPastDue(loan.maturity_date)[0];
    if (isComingDue) {
      return loan;
    }
    return null;
  });

  const pastDueLoans = loans.filter((loan) => {
    const isPastDue = isLoanComingOrPastDue(loan.maturity_date)[1];
    if (isPastDue) {
      return loan;
    }
    return null;
  });

  const loansComingDueHTML =
    comingDueLoans.length > 0 ? (
      <ReportLoansDataGrid
        isCompanyVisible={false}
        isReportingVisible={true}
        isSortingDisabled
        isStatusVisible={true}
        isDisbursementIdentifierVisible={true}
        isMaturityVisible={true}
        isDaysPastDueVisible={false}
        loans={comingDueLoans}
      />
    ) : (
      <p>There are no loans coming due at this time.</p>
    );

  const loansPastDueHTML =
    pastDueLoans.length > 0 ? (
      <ReportLoansDataGrid
        isCompanyVisible={false}
        isReportingVisible={true}
        isSortingDisabled
        isStatusVisible={true}
        isDisbursementIdentifierVisible={true}
        isMaturityVisible={true}
        isDaysPastDueVisible={true}
        loans={pastDueLoans}
      />
    ) : (
      <p>There are no loans past due at this time.</p>
    );

  return (
    <PageContent
      title={"Reports"}
      subtitle={
        "View reports related to your contract(s) with Bespoke Financial."
      }
    >
      <Box display="flex" flexDirection="column">
        <Typography variant="h6">Loans Coming Due</Typography>
        {loansComingDueHTML}
      </Box>
      <Box display="flex" flexDirection="column">
        <Typography variant="h6">Loans Past Due</Typography>
        {loansPastDueHTML}
      </Box>
      {/*<Box display="flex" flexDirection="column">
        <h3>Month End Summary LOC</h3>
      </Box>
      <Box display="flex" flexDirection="column">
        <h3>Month End Summary Non-LOC</h3>
      </Box>*/}
    </PageContent>
  );
}
