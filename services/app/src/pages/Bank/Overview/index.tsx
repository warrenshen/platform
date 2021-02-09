import Page from "components/Shared/Page";
import {
  LoanStatusEnum,
  RequestStatusEnum,
  useLoansByStatusesForBankQuery,
} from "generated/graphql";
import useAppBarTitle from "hooks/useAppBarTitle";
import { bankRoutes } from "lib/routes";
import LoansTable from "pages/Bank/Overview/BankDashboard/LoansTable";
import { useTitle } from "react-use";

function BankOverviewPage() {
  useTitle("Overview | Bespoke");
  useAppBarTitle("Overview");

  const {
    data: approvalRequestedLoansData,
    error: approvalRequestedLoansError,
  } = useLoansByStatusesForBankQuery({
    variables: {
      statuses: [LoanStatusEnum.ApprovalRequested],
    },
  });

  const {
    data: maturingLoansData,
    error: maturingLoansError,
  } = useLoansByStatusesForBankQuery({
    variables: {
      statuses: [LoanStatusEnum.Approved, LoanStatusEnum.Funded],
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

  if (approvalRequestedLoansError) {
    alert(
      "Error querying approval requested loans. " + approvalRequestedLoansError
    );
  }

  if (maturingLoansError) {
    alert("Error querying maturing loans. " + maturingLoansError);
  }

  if (pastDueLoansError) {
    alert("Error querying past due loans. " + pastDueLoansError);
  }

  const approvalRequestedLoans = approvalRequestedLoansData?.loans || [];
  const maturingLoans = maturingLoansData?.loans || [];
  const pastDueLoans = pastDueLoansData?.loans || [];

  return (
    <Page>
      <LoansTable
        loans={approvalRequestedLoans}
        tableName={"Loans Approval Requested"}
        routeToTablePage={bankRoutes.loansApprovalRequested}
        loansPastDue={false}
        filterByStatus={RequestStatusEnum.ApprovalRequested}
      ></LoansTable>
      <LoansTable
        loans={maturingLoans}
        tableName={"Loans Maturing in 14 Days"}
        routeToTablePage={bankRoutes.loansMaturing}
        loansPastDue={false}
        matureDays={14}
      ></LoansTable>
      <LoansTable
        loans={pastDueLoans}
        tableName={"Loans Past Due"}
        routeToTablePage={bankRoutes.loansPastDue}
        loansPastDue={true}
      ></LoansTable>
    </Page>
  );
}

export default BankOverviewPage;
