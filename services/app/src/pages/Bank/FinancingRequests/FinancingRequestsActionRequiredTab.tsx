import { Box } from "@material-ui/core";
import CreateAdvanceModal from "components/Advance/CreateAdvanceModal";
import ArchiveLoanModal from "components/Loans/ArchiveLoanModal";
import BankFinancingRequestsDataGrid from "components/Loans/BankFinancingRequestsDataGrid";
import ReviewFinancingRequestRejectModal from "components/Loans/RejectFinancingRequestModal";
import PrimaryButton from "components/Shared/Button/PrimaryButton";
import SecondaryButton from "components/Shared/Button/SecondaryButton";
import SecondaryWarningButton from "components/Shared/Button/SecondaryWarningButton";
import Can from "components/Shared/Can";
import Text, { TextVariants } from "components/Shared/Text/Text";
import { LoanFragment, Loans, UserRolesEnum } from "generated/graphql";
import useSnackbar from "hooks/useSnackbar";
import { approveLoans } from "lib/api/loans";
import { Action, check } from "lib/auth/rbac-rules";
import { LoanStatusEnum } from "lib/enum";
import { BankCompanyRouteEnum, getBankCompanyRoute } from "lib/routes";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  width: 100%;
`;

interface Props {
  financingRequests: LoanFragment[];
  userRole: UserRolesEnum | null;
}

export default function BankFinancingRequestsActionRequiredTab({
  financingRequests,
  userRole,
}: Props) {
  const navigate = useNavigate();
  const snackbar = useSnackbar();

  // // State for modal(s).
  const [selectedFinancingRequestIds, setSelectedFinancingRequestIds] =
    useState<Loans["id"]>([]);

  const [isCreateAdvanceModalOpen, setIsCreateAdvanceModalOpen] =
    useState<boolean>(false);
  const [
    isRejectFinancingRequestModalOpen,
    setIsRejectFinancingRequestModalOpen,
  ] = useState<boolean>(false);
  const [
    isArchiveFinancingRequestModalOpen,
    setIsArchiveFinancingRequestModalOpen,
  ] = useState<boolean>(false);

  const selectedFinancingRequests = useMemo(
    () =>
      financingRequests.filter(
        (financingRequest: any) =>
          selectedFinancingRequestIds.indexOf(financingRequest.id) >= 0
      ) || [],
    [financingRequests, selectedFinancingRequestIds]
  );

  const handleSelectFinancingRequests = useMemo(
    () => (loans: LoanFragment[]) => {
      setSelectedFinancingRequestIds(loans.map((loan) => loan.id));
    },
    [setSelectedFinancingRequestIds]
  );

  const handleApproveFinancingRequests = async () => {
    const response = await approveLoans(selectedFinancingRequestIds);
    if (response.status !== "OK") {
      snackbar.showError(
        `Could not approve financing requests. Error: ${response.msg}`
      );
    } else {
      snackbar.showSuccess("Financing request(s) approved.");
      setSelectedFinancingRequestIds([]);
    }
  };

  const selectedFinancingRequest = useMemo(
    () =>
      selectedFinancingRequestIds.length === 1
        ? financingRequests.find(
            (loan) => loan.id === selectedFinancingRequestIds[0]
          )
        : null,
    [financingRequests, selectedFinancingRequestIds]
  );

  const approvalRequestedSelectedFinancingRequests = useMemo(
    () =>
      selectedFinancingRequests.filter(
        (loan) => loan.status === LoanStatusEnum.ApprovalRequested
      ),
    [selectedFinancingRequests]
  );

  const approvedSelectedFinancingRequestIds = useMemo(
    () =>
      selectedFinancingRequests
        .filter((loan) => loan.status === LoanStatusEnum.Approved)
        .map((loan) => loan.id),
    [selectedFinancingRequests]
  );

  const changesRequestedSelectedFinancingRequests = useMemo(
    () =>
      selectedFinancingRequests.filter(
        (loan) => loan.status === LoanStatusEnum.Rejected
      ),
    [selectedFinancingRequests]
  );

  return (
    <Container>
      {isCreateAdvanceModalOpen && (
        <CreateAdvanceModal
          selectedLoanIds={approvedSelectedFinancingRequestIds}
          handleClose={() => {
            setSelectedFinancingRequestIds([]);
            setIsCreateAdvanceModalOpen(false);
          }}
        />
      )}
      {isRejectFinancingRequestModalOpen && (
        <ReviewFinancingRequestRejectModal
          loanId={selectedFinancingRequestIds[0]}
          handleClose={() => {
            setSelectedFinancingRequestIds([]);
            setIsRejectFinancingRequestModalOpen(false);
          }}
        />
      )}
      {isRejectFinancingRequestModalOpen && (
        <ReviewFinancingRequestRejectModal
          loanId={selectedFinancingRequestIds[0]}
          handleClose={() => {
            setSelectedFinancingRequestIds([]);
            setIsRejectFinancingRequestModalOpen(false);
          }}
        />
      )}
      {isArchiveFinancingRequestModalOpen && (
        <ArchiveLoanModal
          loan={selectedFinancingRequest}
          action={Action.ArchiveLoan}
          isFinancingRequest
          handleClose={() => {
            setSelectedFinancingRequestIds([]);
            setIsArchiveFinancingRequestModalOpen(false);
          }}
        />
      )}
      <Box display="flex" justifyContent="space-between">
        <Text textVariant={TextVariants.ParagraphLead}>Action Required</Text>
        <Box mb={2} display="flex" flexDirection="row-reverse">
          {approvedSelectedFinancingRequestIds.length > 0 && (
            <Can perform={Action.CreateAdvance}>
              <PrimaryButton
                isDisabled={
                  approvalRequestedSelectedFinancingRequests.length > 0 ||
                  changesRequestedSelectedFinancingRequests.length > 0
                }
                text={"Create Advance"}
                onClick={() => setIsCreateAdvanceModalOpen(true)}
              />
            </Can>
          )}
          {approvalRequestedSelectedFinancingRequests.length > 0 && (
            <Can perform={Action.ApproveLoan}>
              <PrimaryButton
                isDisabled={
                  changesRequestedSelectedFinancingRequests.length > 0 ||
                  approvedSelectedFinancingRequestIds.length > 0
                }
                text={"Approve"}
                onClick={handleApproveFinancingRequests}
              />
            </Can>
          )}
          {approvalRequestedSelectedFinancingRequests.length === 1 && (
            <Can perform={Action.RejectLoan}>
              <SecondaryWarningButton
                isDisabled={!selectedFinancingRequest}
                text={"Reject"}
                onClick={() => setIsRejectFinancingRequestModalOpen(true)}
              />
            </Can>
          )}
          {selectedFinancingRequestIds.length > 0 && (
            <Can perform={Action.ArchiveLoan}>
              <SecondaryButton
                isDisabled={!selectedFinancingRequest}
                text={"Archive"}
                onClick={() => setIsArchiveFinancingRequestModalOpen(true)}
              />
              <Box mr={2} />
            </Can>
          )}
        </Box>
      </Box>
      <Box display="flex" flexDirection="column">
        <BankFinancingRequestsDataGrid
          financingRequests={financingRequests}
          selectedFinancingRequestIds={selectedFinancingRequestIds}
          isMultiSelectEnabled={check(userRole, Action.SelectLoan)}
          handleClickCustomer={(customerId) => {
            navigate(
              getBankCompanyRoute(customerId, BankCompanyRouteEnum.Loans)
            );
          }}
          handleSelectFinancingRequests={handleSelectFinancingRequests}
        />
      </Box>
    </Container>
  );
}
