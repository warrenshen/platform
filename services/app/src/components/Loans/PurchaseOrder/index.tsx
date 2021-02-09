import { Box, Button } from "@material-ui/core";
import RepaymentButton from "components/Customer/PurchaseOrderLoanRepayment/RepaymentButton";
import Can from "components/Shared/Can";
import {
  LoanFragment,
  LoanTypeEnum,
  useLoansByCompanyAndLoanTypeForCustomerQuery,
} from "generated/graphql";
import useCompanyContext from "hooks/useCompanyContext";
import { ActionType } from "lib/ActionType";
import { Action } from "lib/auth/rbac-rules";
import { useState } from "react";
import CreateUpdatePurchaseOrderLoanModal from "./CreateUpdatePurchaseOrderLoanModal";
import PurchaseOrderLoansDataGrid from "./PurchaseOrderLoansDataGrid";

function Loans() {
  const companyId = useCompanyContext();

  const { data, error, refetch } = useLoansByCompanyAndLoanTypeForCustomerQuery(
    {
      variables: {
        companyId,
        loanType: LoanTypeEnum.PurchaseOrder,
      },
    }
  );
  if (error) {
    alert("Error querying purchase orders. " + error);
  }

  const purchaseOrderLoans = data?.loans || [];
  // State for modal(s).
  const [isCreateUpdateModalOpen, setIsCreateUpdateModalOpen] = useState(false);
  const [targetLoanId, setTargetLoanId] = useState("");
  const [selectedLoans, setSelectedLoans] = useState<LoanFragment[]>([]);

  const handleEditPurchaseOrderLoan = (loanId: string) => {
    setTargetLoanId(loanId);
    setIsCreateUpdateModalOpen(true);
  };

  return (
    <Box>
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
      <Box pb={2} display="flex" flexDirection="row-reverse">
        <Can perform={Action.AddPurchaseOrders}>
          <Button
            onClick={() => setIsCreateUpdateModalOpen(true)}
            variant="contained"
            color="primary"
          >
            Create Loan
          </Button>
        </Can>
        <Can perform={Action.RepayPurchaseOrderLoans}>
          <Box mr={2}>
            <RepaymentButton selectedLoans={selectedLoans}></RepaymentButton>
          </Box>
        </Can>
      </Box>
      <Box display="flex" flex={1}>
        <PurchaseOrderLoansDataGrid
          purchaseOrderLoans={purchaseOrderLoans}
          actionItems={[
            {
              key: "edit-purchase-order-loan",
              label: "Edit",
              handleClick: (params) =>
                handleEditPurchaseOrderLoan(params.row.data.id as string),
            },
          ]}
          handleSelectLoans={(loans) => setSelectedLoans(loans)}
        ></PurchaseOrderLoansDataGrid>
      </Box>
    </Box>
  );
}

export default Loans;
