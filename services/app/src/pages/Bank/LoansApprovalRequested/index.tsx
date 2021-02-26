import { Box, Button } from "@material-ui/core";
import { ValueFormatterParams } from "@material-ui/data-grid";
import CreateAdvanceModal from "components/Advance/CreateAdvanceModal";
import BankLoansDataGrid from "components/Loans/BankLoansDataGrid";
import Page from "components/Shared/Page";
import Can from "components/Shared/Can";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  LoanFragment,
  Loans,
  LoanStatusEnum,
  useLoansByStatusesForBankQuery,
} from "generated/graphql";
import { approveLoans, rejectLoan } from "lib/finance/loans/approval";
import { Action, check } from "lib/auth/rbac-rules";
import { useState, useContext } from "react";

function LoansAllProductsPage() {
  const {
    user: { role },
  } = useContext(CurrentUserContext);

  const { data, error, refetch } = useLoansByStatusesForBankQuery({
    variables: {
      statuses: [LoanStatusEnum.ApprovalRequested, LoanStatusEnum.Approved],
    },
  });

  // State for modal(s).
  const [isCreateAdvanceModalOpen, setIsCreateAdvanceModalOpen] = useState(
    false
  );
  const [selectedLoans, setSelectedLoans] = useState<LoanFragment[]>([]);
  const [selectedLoanIds, setSelectedLoanIds] = useState<Loans["id"]>([]);

  if (error) {
    alert("Error querying loans. " + error);
  }

  const handleApproveLoans = async () => {
    const response = await approveLoans(selectedLoanIds);
    if (response.status !== "OK") {
      alert("Could not approve loans!");
    }
    refetch();
  };

  const handleApproveLoan = async (loanId: string) => {
    const response = await approveLoans([loanId]);
    if (response.status !== "OK") {
      alert("Could not approve loan. Reason: " + response.msg);
    }
    refetch();
  };

  const handleRejectLoan = async (loanId: string) => {
    // TODO(warren): Handle entering a real rejection reason
    const response = await rejectLoan({
      loan_id: loanId,
      rejection_note: "Default rejection reason",
    });
    if (response.status !== "OK") {
      alert("Could not reject loan. Reason: " + response.msg);
    }
    refetch();
  };

  const loans = data?.loans || [];

  const approvalRequestedSelectedLoans = selectedLoans.filter(
    (loan) => loan.status === LoanStatusEnum.ApprovalRequested
  );
  const approvedSelectedLoans = selectedLoans.filter(
    (loan) => loan.status === LoanStatusEnum.Approved
  );

  return (
    <Page appBarTitle={"Loans - Action Required"}>
      <Box mb={2} display="flex" flexDirection="row-reverse">
        {isCreateAdvanceModalOpen && (
          <CreateAdvanceModal
            selectedLoans={selectedLoans}
            handleClose={() => {
              refetch();
              setSelectedLoans([]);
              setSelectedLoanIds([]);
              setIsCreateAdvanceModalOpen(false);
            }}
          />
        )}
        <Can perform={Action.CreateAdvance}>
          <Box>
            <Button
              disabled={approvedSelectedLoans.length <= 0}
              variant="contained"
              color="primary"
              onClick={() => setIsCreateAdvanceModalOpen(true)}
            >
              Create Advance
            </Button>
          </Box>
        </Can>
        <Can perform={Action.ApproveLoan}>
          <Box mr={2}>
            <Button
              disabled={approvalRequestedSelectedLoans.length <= 0}
              variant="contained"
              color="primary"
              onClick={handleApproveLoans}
            >
              Approve Loan(s)
            </Button>
          </Box>
        </Can>
      </Box>
      <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
        <BankLoansDataGrid
          isMaturityVisible={false}
          fullView
          loansPastDue={false}
          loans={loans}
          selectedLoanIds={selectedLoanIds}
          actionItems={[
            ...(check(role, Action.ApproveLoan)
              ? [
                  {
                    key: "approve-loan",
                    label: "Approve Loan",
                    handleClick: (params: ValueFormatterParams) =>
                      handleApproveLoan(params.row.data.id as string),
                  },
                ]
              : []),
            ...(check(role, Action.RejectLoan)
              ? [
                  {
                    key: "reject-loan",
                    label: "Reject Loan",
                    handleClick: (params: ValueFormatterParams) =>
                      handleRejectLoan(params.row.data.id as string),
                  },
                ]
              : []),
          ]}
          handleSelectLoans={(loans) => {
            setSelectedLoans(loans);
            setSelectedLoanIds(loans.map((loan) => loan.id));
          }}
          isMultiSelectEnabled={check(role, Action.SelectLoan)}
        />
      </Box>
    </Page>
  );
}

export default LoansAllProductsPage;
