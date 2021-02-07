import { Box, Button } from "@material-ui/core";
import RepaymentButton from "components/Customer/PurchaseOrderLoanRepayment/RepaymentButton";
import PurchaseOrderLoansView from "components/Loans/PurchaseOrder/PurchaseOrderLoansView";
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
      loanType: LoanTypeEnum.LineOfCredit,
    },
  });
  if (error) {
    alert("Error querying purchase orders. " + error);
  }

  const purchaseOrderLoans = data?.loans || [];
  // State for create / update Purchase Order modal(s).
  const [isCreateUpdateModalOpen, setIsCreateUpdateModalOpen] = useState(false);
  const [selectedLoans, setSelectedLoans] = useState<LoanFragment[]>([]);

  return (
    <Box>
      <Box>Line of Credit</Box>
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

export default Loans;
