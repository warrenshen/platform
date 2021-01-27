import { Box, Button } from "@material-ui/core";
import RepaymentButton from "components/Customer/PurchaseOrderLoanRepayment/RepaymentButton";
import ListPurchaseOrderLoans from "components/PurchaseOrderLoans/ListPurchaseOrderLoans";
import Can from "components/Shared/Can";
import { useListPurchaseOrderLoansForCustomerQuery } from "generated/graphql";
import useCompanyContext from "hooks/useCompanyContext";
import { ActionType } from "lib/ActionType";
import { Action } from "lib/auth/rbac-rules";
import { useState } from "react";
import CreateUpdatePurchaseOrderLoanModal from "./CreateUpdatePurchaseOrderLoanModal";

function PurchaseOrderLoansView() {
  const companyId = useCompanyContext();

  const { data, refetch, error } = useListPurchaseOrderLoansForCustomerQuery({
    variables: {
      companyId,
    },
  });

  if (error) {
    window.console.log("Error querying purchase orders. Error: " + error);
  }

  const purchaseOrderLoans = data?.purchase_order_loans || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetPurchaseOrderLoanId, setTargetPurchaseOrderLoanId] = useState(
    ""
  );

  const handleEditPurchaseOrderLoan = (purchaseOrderLoanId: string) => {
    setTargetPurchaseOrderLoanId(purchaseOrderLoanId);
    setIsModalOpen(true);
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
        handleEditPurchaseOrderLoan={handleEditPurchaseOrderLoan}
      ></ListPurchaseOrderLoans>
    </Box>
  );
}

export default PurchaseOrderLoansView;
