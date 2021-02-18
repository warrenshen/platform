import Page from "components/Shared/Page";
import {
  LoanStatusEnum,
  useLoansByStatusesForBankQuery,
} from "generated/graphql";
import { bankRoutes } from "lib/routes";
import BankOverviewLoansTable from "pages/Bank/Overview/BankOverviewLoansTable";

function BankOverviewPage() {
  const {
    data: maturingLoansData,
    error: maturingLoansError,
  } = useLoansByStatusesForBankQuery({
    variables: {
      statuses: [LoanStatusEnum.Funded],
    },
  });

  const {
    data: pastDueLoansData,
    error: pastDueLoansError,
  } = useLoansByStatusesForBankQuery({
    variables: {
      statuses: [LoanStatusEnum.PastDue],
    },
  });

  if (maturingLoansError) {
    alert("Error querying maturing loans. " + maturingLoansError);
  }

  if (pastDueLoansError) {
    alert("Error querying past due loans. " + pastDueLoansError);
  }

  const maturingLoans = maturingLoansData?.loans || [];
  const pastDueLoans = pastDueLoansData?.loans || [];

  return (
    <Page appBarTitle={"Overview"}>
      <BankOverviewLoansTable
        isMaturityVisible
        loans={maturingLoans}
        tableName={"Loans Maturing in 14 Days"}
        routeToTablePage={bankRoutes.loansMaturing}
        loansPastDue={false}
        matureDays={14}
      />
      <BankOverviewLoansTable
        isMaturityVisible
        loans={pastDueLoans}
        tableName={"Loans Past Due"}
        routeToTablePage={bankRoutes.loansPastDue}
        loansPastDue={true}
      />
    </Page>
  );
}

export default BankOverviewPage;
