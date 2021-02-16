import { Box } from "@material-ui/core";
import BankLoansDataGrid from "components/Loans/BankLoansDataGrid";
import Page from "components/Shared/Page";
import {
  LoanStatusEnum,
  useLoansByStatusesForBankQuery,
} from "generated/graphql";
import { approveLoan, rejectLoan } from "lib/finance/loans/approval";

function LoansAllProductsPage() {
  const { data, error, refetch } = useLoansByStatusesForBankQuery({
    variables: {
      statuses: [LoanStatusEnum.ApprovalRequested],
    },
  });

  if (error) {
    alert("Error querying loans. " + error);
  }

  const handleApproveLoan = async (loanId: string) => {
    const resp = await approveLoan({ loan_id: loanId });
    if (resp.status !== "OK") {
      alert("Could not approve loan. Reason: " + resp.msg);
    }
    refetch();
  };

  const handleRejectLoan = async (loanId: string) => {
    // TODO(warren): Handle entering a real rejection reason
    const resp = await rejectLoan({
      loan_id: loanId,
      rejection_note: "Default rejection reason",
    });
    if (resp.status !== "OK") {
      alert("Could not reject loan. Reason: " + resp.msg);
    }
    refetch();
  };

  const loans = data?.loans || [];

  return (
    <Page appBarTitle={"Loans Approval Requested"}>
      <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
        <BankLoansDataGrid
          isMaturityVisible={false}
          fullView
          loansPastDue={false}
          loans={loans}
          actionItems={[
            {
              key: "approve-loan",
              label: "Approve Loan",
              handleClick: (params) =>
                handleApproveLoan(params.row.data.id as string),
            },
            {
              key: "reject-loan",
              label: "Reject Loan",
              handleClick: (params) =>
                handleRejectLoan(params.row.data.id as string),
            },
          ]}
        />
      </Box>
    </Page>
  );
}

export default LoansAllProductsPage;
