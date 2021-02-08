import { Box } from "@material-ui/core";
import ViewLoanModal from "components/Shared/Loans/ViewLoanModal";
import {
  LoanFragment,
  LoanStatusEnum,
  useUpdateLoanMutation,
} from "generated/graphql";
import { ActionType } from "lib/ActionType";
import { useState } from "react";
import UpdateLoanNotesModal from "../UpdateLoanNotesModal";
import CreateUpdatePurchaseOrderLoanModal from "./CreateUpdatePurchaseOrderLoanModal";
import ListPurchaseOrderLoans from "./ListPurchaseOrderLoans";

interface Props {
  isDataLoading: boolean;
  purchaseOrderLoans: LoanFragment[];
  refetch: () => void;
  handleSelectLoans?: (loans: LoanFragment[]) => void;
  isCreateUpdateModalOpen: boolean;
  setIsCreateUpdateModalOpen: (val: boolean) => void;
}

/**
 * This component is shared between a bank user and a customer user use case.
 */
function PurchaseOrderLoansView({
  isDataLoading,
  purchaseOrderLoans,
  refetch,
  handleSelectLoans = () => {},
  isCreateUpdateModalOpen,
  setIsCreateUpdateModalOpen,
}: Props) {
  // State for view Purchase Order modal.
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // State for Loan modal(s).
  const [isUpdateLoanNotesModalOpen, setIsUpdateLoanNotesModalOpen] = useState(
    false
  );
  const [targetLoanId, setTargetLoanId] = useState("");

  const [
    updateLoan,
    { loading: isUpdateLoanLoading },
  ] = useUpdateLoanMutation();

  const handleViewLoan = (loanId: string) => {
    setTargetLoanId(loanId);
    setIsViewModalOpen(true);
  };

  const handleEditPurchaseOrderLoan = (loanId: string) => {
    setTargetLoanId(loanId);
    setIsCreateUpdateModalOpen(true);
  };

  const handleApproveLoan = async (loanId: string) => {
    // TODO (Warren): do we need a Loans.approved_at?
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

  const handleEditLoanNotes = (loanId: string) => {
    setTargetLoanId(loanId);
    setIsUpdateLoanNotesModalOpen(true);
  };

  const isDataReady = isDataLoading || isUpdateLoanLoading;
  console.log({ isDataReady });

  return (
    <Box flex={1} display="flex" flexDirection="column" width="100%">
      {isViewModalOpen && (
        <ViewLoanModal
          loanId={targetLoanId}
          handleClose={() => {
            setTargetLoanId("");
            setIsViewModalOpen(false);
          }}
        ></ViewLoanModal>
      )}
      {isCreateUpdateModalOpen && (
        <CreateUpdatePurchaseOrderLoanModal
          actionType={targetLoanId === "" ? ActionType.New : ActionType.Update}
          loanId={targetLoanId}
          handleClose={() => {
            setTargetLoanId("");
            refetch();
            setIsCreateUpdateModalOpen(false);
          }}
        ></CreateUpdatePurchaseOrderLoanModal>
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
      <Box display="flex" flex={1}>
        <ListPurchaseOrderLoans
          purchaseOrderLoans={purchaseOrderLoans}
          handleApproveLoan={handleApproveLoan}
          handleEditLoanNotes={handleEditLoanNotes}
          handleEditPurchaseOrderLoan={handleEditPurchaseOrderLoan}
          handleViewLoan={handleViewLoan}
          handleRejectLoan={handleRejectLoan}
          handleSelectLoans={handleSelectLoans}
        ></ListPurchaseOrderLoans>
      </Box>
    </Box>
  );
}

export default PurchaseOrderLoansView;
