import { Box, Button } from "@material-ui/core";
import CreateAdvanceModal from "components/Bank/Advance/CreateAdvanceModal";
import PurchaseOrderLoansDataGrid from "components/Loans/PurchaseOrder/PurchaseOrderLoansDataGrid";
import UpdateLoanNotesModal from "components/Loans/UpdateLoanNotesModal";
import {
  LoanFragment,
  LoanStatusEnum,
  LoanTypeEnum,
  useLoansByCompanyAndLoanTypeForBankQuery,
  useUpdateLoanMutation,
} from "generated/graphql";
import React, { useState } from "react";

interface Props {
  companyId: string;
}

function BankCustomerLoansSubpage({ companyId }: Props) {
  const {
    data,
    error,
    loading: isLoansLoading,
    refetch,
  } = useLoansByCompanyAndLoanTypeForBankQuery({
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
    variables: {
      companyId,
      loanType: LoanTypeEnum.PurchaseOrder,
    },
  });
  if (error) {
    alert("Error querying purchase orders. " + error);
  }

  const purchaseOrderLoans = data?.loans || [];

  // State for modal(s).
  const [isCreateAdvanceModalOpen, setIsCreateAdvanceModalOpen] = useState(
    false
  );
  const [isUpdateLoanNotesModalOpen, setIsUpdateLoanNotesModalOpen] = useState(
    false
  );
  const [targetLoanId, setTargetLoanId] = useState("");
  const [selectedLoans, setSelectedLoans] = useState<LoanFragment[]>([]);

  const [
    updateLoan,
    { loading: isUpdateLoanLoading },
  ] = useUpdateLoanMutation();

  const handleEditLoanNotes = (loanId: string) => {
    setTargetLoanId(loanId);
    setIsUpdateLoanNotesModalOpen(true);
  };

  const handleApproveLoan = async (loanId: string) => {
    // TODO (warrenshen): do we need a Loans.approved_at?
    const response = await updateLoan({
      variables: {
        id: loanId,
        loan: {
          status: LoanStatusEnum.Approved,
        },
      },
    });
    const savedLoan = response.data?.update_loans_by_pk;
    if (!savedLoan) {
      alert("Could not approve loan");
    }
    refetch();
  };

  const handleRejectLoan = async (loanId: string) => {
    // TODO (Warren): what to do about Loans.reject_by_user_id and Loans.rejection_notes?
    const response = await updateLoan({
      variables: {
        id: loanId,
        loan: {
          status: LoanStatusEnum.Rejected,
          rejected_at: "now()",
        },
      },
    });
    const savedLoan = response.data?.update_loans_by_pk;
    if (!savedLoan) {
      alert("Could not reject loan");
    }
    refetch();
  };

  const isDataReady = isLoansLoading || isUpdateLoanLoading;
  console.log({ isDataReady });

  return (
    <Box>
      {isCreateAdvanceModalOpen && (
        <CreateAdvanceModal
          selectedLoans={selectedLoans}
          handleClose={() => {
            setIsCreateAdvanceModalOpen(false);
          }}
        ></CreateAdvanceModal>
      )}
      {isUpdateLoanNotesModalOpen && (
        <UpdateLoanNotesModal
          loanId={targetLoanId}
          handleClose={() => {
            setTargetLoanId("");
            refetch();
            setIsUpdateLoanNotesModalOpen(false);
          }}
        ></UpdateLoanNotesModal>
      )}
      <Box mb={2} display="flex" flexDirection="row-reverse">
        <Button
          disabled={selectedLoans.length <= 0}
          variant="contained"
          color="primary"
          onClick={() => setIsCreateAdvanceModalOpen(true)}
        >
          Create Advance
        </Button>
      </Box>
      <Box display="flex" flex={1}>
        <PurchaseOrderLoansDataGrid
          purchaseOrderLoans={purchaseOrderLoans}
          actionItems={[
            {
              key: "edit-loan-notes",
              label: "Edit Internal Note",
              handleClick: (params) =>
                handleEditLoanNotes(params.row.data.id as string),
            },
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
          handleSelectLoans={(loans) => setSelectedLoans(loans)}
        ></PurchaseOrderLoansDataGrid>
      </Box>
    </Box>
  );
}

export default BankCustomerLoansSubpage;
