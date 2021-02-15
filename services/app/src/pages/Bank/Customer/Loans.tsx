import { Box, Button } from "@material-ui/core";
import CreateAdvanceModal from "components/Advance/CreateAdvanceModal";
import PurchaseOrderLoansDataGrid from "components/Loans/PurchaseOrder/PurchaseOrderLoansDataGrid";
import UpdateLoanNotesModal from "components/Loans/UpdateLoanNotesModal";
import {
  LoanFragment,
  Loans,
  LoanTypeEnum,
  useLoansByCompanyAndLoanTypeForBankQuery,
} from "generated/graphql";
import { approveLoan, rejectLoan } from "lib/finance/loans/approval";
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
  const [selectedLoanIds, setSelectedLoanIds] = useState<Loans["id"]>([]);

  const handleEditLoanNotes = (loanId: string) => {
    setTargetLoanId(loanId);
    setIsUpdateLoanNotesModalOpen(true);
  };

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

  const isDataReady = isLoansLoading; // || isUpdateLoanLoading
  console.log({ isDataReady });

  return (
    <Box>
      {isCreateAdvanceModalOpen && (
        <CreateAdvanceModal
          selectedLoans={selectedLoans}
          handleClose={() => {
            refetch();
            setIsCreateAdvanceModalOpen(false);
            setSelectedLoans([]);
            setSelectedLoanIds([]);
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
          selectedLoanIds={selectedLoanIds}
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
          handleSelectLoans={(loans) => {
            setSelectedLoans(loans);
            setSelectedLoanIds(loans.map((loan) => loan.id));
          }}
        ></PurchaseOrderLoansDataGrid>
      </Box>
    </Box>
  );
}

export default BankCustomerLoansSubpage;
