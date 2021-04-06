import { Box, Button } from "@material-ui/core";
import CreateAdvanceModal from "components/Advance/CreateAdvanceModal";
import ReviewLoanRejectModal from "components/Loan/ReviewLoanRejectModal";
import LoansDataGrid from "components/Loans/LoansDataGrid";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  LoanFragment,
  Loans,
  LoanStatusEnum,
  useGetNotFundedLoansForBankSubscription,
} from "generated/graphql";
import useSnackbar from "hooks/useSnackbar";
import { approveLoans } from "lib/api/loans";
import { Action, check } from "lib/auth/rbac-rules";
import { useContext, useMemo, useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  width: 100%;
`;

function BankLoansActionRequiredTab() {
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

  const loans = useMemo(() => data?.loans || [], [data?.loans]);
  const approvalRequestedSelectedLoans = useMemo(
    () =>
      selectedLoans.filter(
        (loan) => loan.status === LoanStatusEnum.ApprovalRequested
      ),
    [selectedLoans]
  );
  const approvedSelectedLoans = useMemo(
    () =>
      selectedLoans.filter((loan) => loan.status === LoanStatusEnum.Approved),
    [selectedLoans]
  );

  return (
    <Container>
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
            <ModalButton
              isDisabled={
                approvalRequestedSelectedLoans.length !== 1 ||
                approvedSelectedLoans.length > 0
              }
              label={"Reject Loan"}
              modal={({ handleClose }) => (
                <ReviewLoanRejectModal
                  loanId={selectedLoanIds[0]}
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
      </Box>
      <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
        <LoansDataGrid
          isArtifactVisible
          isCompanyVisible
          isMaturityVisible={false}
          isMultiSelectEnabled={check(role, Action.SelectLoan)}
          isFilteringEnabled
          isExcelExport
          loans={loans}
          selectedLoanIds={selectedLoanIds}
          handleSelectLoans={handleSelectLoans}
        />
      </Box>
    </Container>
  );
}

export default BankLoansActionRequiredTab;
