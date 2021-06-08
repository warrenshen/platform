import { Box, Button } from "@material-ui/core";
import CreateAdvanceModal from "components/Advance/CreateAdvanceModal";
import DeleteLoanModal from "components/Loan/DeleteLoanModal";
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
import { useHistory } from "react-router-dom";
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

export default function BankLoansActionRequiredTab() {
  const history = useHistory();
  const snackbar = useSnackbar();

  const {
    user: { role },
  } = useContext(CurrentUserContext);

  const { data, error } = useGetNotFundedLoansForBankSubscription();

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  // State for modal(s).
  const [selectedLoanIds, setSelectedLoanIds] = useState<Loans["id"]>([]);

  const selectedLoans = useMemo(
    () =>
      data?.loans.filter((loan) => selectedLoanIds.indexOf(loan.id) >= 0) || [],
    [data?.loans, selectedLoanIds]
  );

  const handleSelectLoans = useMemo(
    () => (loans: LoanFragment[]) => {
      setSelectedLoanIds(loans.map((loan) => loan.id));
    },
    [setSelectedLoanIds]
  );

  const handleApproveLoans = async () => {
    const response = await approveLoans(selectedLoanIds);
    if (response.status !== "OK") {
      snackbar.showError(`Could not approve loans. Error: ${response.msg}`);
    } else {
      snackbar.showSuccess("Loan(s) approved.");
      setSelectedLoanIds([]);
    }
  };

  const loans = useMemo(() => data?.loans || [], [data?.loans]);

  const selectedLoan = useMemo(
    () =>
      selectedLoanIds.length === 1
        ? loans.find((loan) => loan.id === selectedLoanIds[0])
        : null,
    [loans, selectedLoanIds]
  );

  const approvalRequestedSelectedLoans = useMemo(
    () =>
      selectedLoans.filter(
        (loan) => loan.status === LoanStatusEnum.ApprovalRequested
      ),
    [selectedLoans]
  );

  const approvedSelectedLoanIds = useMemo(
    () =>
      selectedLoans
        .filter((loan) => loan.status === LoanStatusEnum.Approved)
        .map((loan) => loan.id),
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
                approvedSelectedLoanIds.length <= 0
              }
              label={"Create Advance"}
              modal={({ handleClose }) => (
                <CreateAdvanceModal
                  selectedLoanIds={approvedSelectedLoanIds}
                  handleClose={() => {
                    handleClose();
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
                approvedSelectedLoanIds.length > 0
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
                approvedSelectedLoanIds.length > 0
              }
              label={"Reject Loan"}
              modal={({ handleClose }) => (
                <ReviewLoanRejectModal
                  loanId={selectedLoanIds[0]}
                  handleClose={() => {
                    handleClose();
                    setSelectedLoanIds([]);
                  }}
                />
              )}
            />
          </Box>
        </Can>
        {!!selectedLoan && (
          <Can perform={Action.DeleteLoans}>
            <Box mr={2}>
              <ModalButton
                isDisabled={!selectedLoan}
                label={"Delete Loan"}
                variant={"outlined"}
                modal={({ handleClose }) => (
                  <DeleteLoanModal
                    loanId={selectedLoan?.id}
                    handleClose={() => {
                      handleClose();
                      setSelectedLoanIds([]);
                    }}
                  />
                )}
              />
            </Box>
          </Can>
        )}
      </Box>
      <Box display="flex" flexDirection="column">
        <LoansDataGrid
          isArtifactVisible
          isCompanyVisible
          isMaturityVisible={false}
          isMultiSelectEnabled={check(role, Action.SelectLoan)}
          isFilteringEnabled
          loans={loans}
          selectedLoanIds={selectedLoanIds}
          handleClickCustomer={(customerId) =>
            history.push(`/customers/${customerId}/loans`)
          }
          handleSelectLoans={handleSelectLoans}
        />
      </Box>
    </Container>
  );
}
