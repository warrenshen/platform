import { Box, Button } from "@material-ui/core";
import { ValueFormatterParams } from "@material-ui/data-grid";
import CreateAdvanceModal from "components/Advance/CreateAdvanceModal";
import LineOfCreditLoansDataGrid from "components/Loans/LineOfCredit/LineOfCreditLoansDataGrid";
import PurchaseOrderLoansDataGrid from "components/Loans/PurchaseOrder/PurchaseOrderLoansDataGrid";
import UpdateLoanNotesModal from "components/Loans/UpdateLoanNotesModal";
import {
  LoanFragment,
  Loans,
  LoanTypeEnum,
  ProductTypeEnum,
  useLoansByCompanyAndLoanTypeForBankQuery,
} from "generated/graphql";
import { approveLoans, rejectLoan } from "lib/finance/loans/approval";
import { useState } from "react";

interface Props {
  companyId: string;
  productType: ProductTypeEnum;
}

function BankCustomerLoansSubpage({ companyId, productType }: Props) {
  const { data, error, refetch } = useLoansByCompanyAndLoanTypeForBankQuery({
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
    variables: {
      companyId,
      loanType:
        productType === ProductTypeEnum.LineOfCredit
          ? LoanTypeEnum.LineOfCredit
          : LoanTypeEnum.PurchaseOrder,
    },
  });
  if (error) {
    alert("Error querying purchase orders. " + error);
  }

  const loans = data?.loans || [];

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
    const response = await approveLoans([loanId]);
    if (response.status !== "OK") {
      alert("Could not approve loan. Reason: " + response.msg);
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

  const actionItems = [
    {
      key: "edit-loan-notes",
      label: "Edit Internal Note",
      handleClick: (params: ValueFormatterParams) =>
        handleEditLoanNotes(params.row.data.id as string),
    },
    {
      key: "approve-loan",
      label: "Approve Loan",
      handleClick: (params: ValueFormatterParams) =>
        handleApproveLoan(params.row.data.id as string),
    },
    {
      key: "reject-loan",
      label: "Reject Loan",
      handleClick: (params: ValueFormatterParams) =>
        handleRejectLoan(params.row.data.id as string),
    },
  ];

  return (
    <Box>
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
      {isUpdateLoanNotesModalOpen && (
        <UpdateLoanNotesModal
          loanId={targetLoanId}
          handleClose={() => {
            setTargetLoanId("");
            refetch();
            setIsUpdateLoanNotesModalOpen(false);
          }}
        />
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
        {productType === ProductTypeEnum.LineOfCredit ? (
          <LineOfCreditLoansDataGrid
            loans={loans}
            selectedLoanIds={selectedLoanIds}
            actionItems={actionItems}
            handleSelectLoans={(loans) => {
              setSelectedLoans(loans);
              setSelectedLoanIds(loans.map((loan) => loan.id));
            }}
          />
        ) : (
          <PurchaseOrderLoansDataGrid
            loans={loans}
            selectedLoanIds={selectedLoanIds}
            actionItems={actionItems}
            handleSelectLoans={(loans) => {
              setSelectedLoans(loans);
              setSelectedLoanIds(loans.map((loan) => loan.id));
            }}
          />
        )}
      </Box>
    </Box>
  );
}

export default BankCustomerLoansSubpage;
