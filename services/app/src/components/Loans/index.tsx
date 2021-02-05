import { Box, Button } from "@material-ui/core";
import RepaymentButton from "components/Customer/PurchaseOrderLoanRepayment/RepaymentButton";
import PurchaseOrderLoansView from "components/Loans/PurchaseOrderLoansView";
import Can from "components/Shared/Can";
import {
  LoanFragment,
  LoanTypeEnum,
  useLoansByCompanyAndLoanTypeForCustomerQuery,
} from "generated/graphql";
import useCompanyContext from "hooks/useCompanyContext";
import { Action } from "lib/auth/rbac-rules";
import { useState } from "react";

// For now, loans will allow you to view 1 of the loan views,
// e.g., Purchase Order Loans, Inventory Financing, etc.
function Loans() {
  const companyId = useCompanyContext();

  const {
    data,
    error,
    loading: isLoansLoading,
    refetch,
  } = useLoansByCompanyAndLoanTypeForCustomerQuery({
    variables: {
      companyId,
      loanType: LoanTypeEnum.PurchaseOrder,
    },
  });
  if (error) {
    alert("Error querying purchase orders. " + error);
  }

  const purchaseOrderLoans = data?.loans || [];
  // State for create / update Purchase Order modal(s).
  const [isCreateUpdateModalOpen, setIsCreateUpdateModalOpen] = useState(false);
  const [selectedLoans, setSelectedLoans] = useState<LoanFragment[]>([]);

  const loanType = "purchase_order";
  if (loanType === "purchase_order") {
    return (
      <Box>
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
        <PurchaseOrderLoansView
          isDataLoading={isLoansLoading}
          purchaseOrderLoans={purchaseOrderLoans}
          refetch={refetch}
          handleSelectLoans={(loans) => setSelectedLoans(loans)}
          isCreateUpdateModalOpen={isCreateUpdateModalOpen}
          setIsCreateUpdateModalOpen={setIsCreateUpdateModalOpen}
        ></PurchaseOrderLoansView>
      </Box>
    );
  }

  return (
    <Box pb={2} display="flex" flexDirection="row-reverse">
      Nothing to display
    </Box>
  );
}

export default Loans;
