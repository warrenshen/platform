import { Box, Button } from "@material-ui/core";
import RepaymentButton from "components/Customer/PurchaseOrderLoanRepayment/RepaymentButton";
import ListPurchaseOrderLoans from "components/PurchaseOrderLoans/ListPurchaseOrderLoans";
import Can from "components/Shared/Can";
import { PurchaseOrderLoanFragment } from "generated/graphql";
import { ActionType } from "lib/ActionType";
import { Action } from "lib/auth/rbac-rules";
import { useState } from "react";
import CreateUpdatePurchaseOrderLoanModal from "./CreateUpdatePurchaseOrderLoanModal";
import UpdateLoanNotesModal from "./UpdateLoanNotesModal";

interface Props {
  purchaseOrderLoans: PurchaseOrderLoanFragment[];
  refetch: () => {};
}
/**
 * This component is shared between a bank user and a customer user use case.
 */
function PurchaseOrderLoansView({ purchaseOrderLoans, refetch }: Props) {
  // State for Purchase Order modal(s).
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetPurchaseOrderLoanId, setTargetPurchaseOrderLoanId] = useState(
    ""
  );

  // State for Loan modal(s).
  const [isUpdateLoanNotesModalOpen, setIsUpdateLoanNotesModalOpen] = useState(
    false
  );
  const [targetLoanId, setTargetLoanId] = useState("");

  const handleEditPurchaseOrderLoan = (purchaseOrderLoanId: string) => {
    setTargetPurchaseOrderLoanId(purchaseOrderLoanId);
    setIsModalOpen(true);
  };

  const handleEditLoanNotes = (loanId: string) => {
    setTargetLoanId(loanId);
    setIsUpdateLoanNotesModalOpen(true);
  };

  return (
    <Box display="flex" flexDirection="column">
      {isModalOpen && (
        <CreateUpdatePurchaseOrderLoanModal
          actionType={
            targetPurchaseOrderLoanId === ""
              ? ActionType.New
              : ActionType.Update
          }
          purchaseOrderLoanId={targetPurchaseOrderLoanId}
          handleClose={() => {
            setTargetPurchaseOrderLoanId("");
            refetch();
            setIsModalOpen(false);
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
      <Box pb={2} display="flex" flexDirection="row-reverse">
        <Can perform={Action.AddPurchaseOrders}>
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="contained"
            color="primary"
          >
            Create Loan
          </Button>
        </Can>
        <Can perform={Action.RepayPurchaseOrderLoans}>
          <Box mr={2}>
            <RepaymentButton></RepaymentButton>
          </Box>
        </Can>
      </Box>
      <ListPurchaseOrderLoans
        purchaseOrderLoans={purchaseOrderLoans}
        handleEditLoanNotes={handleEditLoanNotes}
        handleEditPurchaseOrderLoan={handleEditPurchaseOrderLoan}
      ></ListPurchaseOrderLoans>
    </Box>
  );
}

export default PurchaseOrderLoansView;
