import Page from "components/Shared/Page";
import {
  LoanFragment,
  LoanStatusEnum,
  RequestStatusEnum,
  useLoansByStatusForBankQuery,
  useLoansForBankQuery,
} from "generated/graphql";
import useAppBarTitle from "hooks/useAppBarTitle";
import { bankRoutes } from "lib/routes";
import LoansTable from "pages/Bank/Overview/BankDashboard/LoansTable";
import { useTitle } from "react-use";

function BankOverviewPage() {
  useTitle("Overview | Bespoke");
  useAppBarTitle("Overview");

  const { data, error } = useLoansForBankQuery();

  const {
    data: approvalRequestedLoansData,
    error: approvalRequestedLoansError,
  } = useLoansByStatusForBankQuery({
    variables: {
      status: LoanStatusEnum.ApprovalRequested,
    },
  });

  if (error) {
    alert("Error querying loans. " + error);
  }

  if (approvalRequestedLoansError) {
    alert("Error querying approval requested loan. " + error);
  }

  const loans = (data?.loans || []) as LoanFragment[];
  const approvalRequestedLoans = approvalRequestedLoansData?.loans || [];

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
        loans={loans}
        tableName={"Loans Maturing in 14 Days"}
        routeToTablePage={bankRoutes.loansMaturing}
        loansPastDue={false}
        matureDays={14}
      ></LoansTable>
      <LoansTable
        loans={loans}
        tableName={"Loans Past Due"}
        routeToTablePage={bankRoutes.loansPastDue}
        loansPastDue={true}
      ></LoansTable>
    </Page>
  );
}

export default BankOverviewPage;
