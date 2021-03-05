import { Box, Button } from "@material-ui/core";
import CreateAdvanceModal from "components/Advance/CreateAdvanceModal";
import LoansDataGrid from "components/Loans/LoansDataGrid";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import Page from "components/Shared/Page";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  LoanFragment,
  Loans,
  LoanStatusEnum,
  useGetNotFundedLoansForBankSubscription,
} from "generated/graphql";
import useSnackbar from "hooks/useSnackbar";
import { Action, check } from "lib/auth/rbac-rules";
import { approveLoans, rejectLoan } from "lib/finance/loans/approval";
import { useContext, useMemo, useState } from "react";

function LoansActionRequiredPage() {
  const snackbar = useSnackbar();
  const {
    user: { role },
  } = useContext(CurrentUserContext);

  const { data, error } = useGetNotFundedLoansForBankSubscription();

  if (error) {
    alert("Error querying loans. " + error);
  }

  // State for modal(s).
  const [selectedLoans, setSelectedLoans] = useState<LoanFragment[]>([]);
  const [selectedLoanIds, setSelectedLoanIds] = useState<Loans["id"]>([]);

  const handleSelectLoans = useMemo(
    () => (loans: LoanFragment[]) => {
      setSelectedLoans(loans);
      setSelectedLoanIds(loans.map((loan) => loan.id));
    },
    [setSelectedLoanIds]
  );

  const handleApproveLoans = async () => {
    const response = await approveLoans(selectedLoanIds);
    if (response.status !== "OK") {
      snackbar.showError("Error! Could not approve loans.");
    } else {
      // TODO (warrenshen):
      // Instead of clearing the selection,
      // can we update the content of the selected loans?
      setSelectedLoanIds([]);
      setSelectedLoans([]);
      snackbar.showSuccess("Success! Loan(s) approved.");
    }
  };

  const handleRejectLoan = async () => {
    // TODO(warren): Handle entering a real rejection reason
    if (selectedLoanIds.length !== 1) {
      snackbar.showError("Error! Developer error with handleRejectLoan.");
      return;
    }
    const response = await rejectLoan({
      loan_id: selectedLoanIds[0],
      rejection_note: "Default rejection reason",
    });
    if (response.status !== "OK") {
      snackbar.showError("Could not reject loan. Reason: " + response.msg);
    } else {
      // TODO (warrenshen):
      // Instead of clearing the selection,
      // can we update the content of the selected loans?
      setSelectedLoanIds([]);
      setSelectedLoans([]);
      snackbar.showSuccess("Success! Loan rejected.");
    }
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
        <Can perform={Action.CreateAdvance}>
          <Box>
            <ModalButton
              isDisabled={
                approvalRequestedSelectedLoans.length > 0 ||
                approvedSelectedLoans.length <= 0
              }
              label={"Create Advance"}
              modal={({ handleClose }) => (
                <CreateAdvanceModal
                  selectedLoans={selectedLoans}
                  handleClose={() => {
                    handleClose();
                    setSelectedLoans([]);
                    setSelectedLoanIds([]);
                  }}
                />
              )}
            />
          </Box>
        </Can>
        <Can perform={Action.ApproveLoan}>
          <Box mr={2}>
            <Button
              disabled={
                approvalRequestedSelectedLoans.length <= 0 ||
                approvedSelectedLoans.length > 0
              }
              variant="contained"
              color="primary"
              onClick={handleApproveLoans}
            >
              Approve Loan(s)
            </Button>
          </Box>
        </Can>
        <Can perform={Action.RejectLoan}>
          <Box mr={2}>
            <Button
              disabled={
                approvalRequestedSelectedLoans.length !== 1 ||
                approvedSelectedLoans.length > 0
              }
              variant="contained"
              color="primary"
              onClick={handleRejectLoan}
            >
              Reject Loan
            </Button>
          </Box>
        </Can>
      </Box>
      <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
        <LoansDataGrid
          isCompanyVisible
          isMaturityVisible={false}
          isFilteringEnabled
          loans={loans}
          selectedLoanIds={selectedLoanIds}
          handleSelectLoans={handleSelectLoans}
          isMultiSelectEnabled={check(role, Action.SelectLoan)}
        />
      </Box>
    </Page>
  );
}

export default LoansActionRequiredPage;
