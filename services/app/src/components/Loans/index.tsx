import { Box } from "@material-ui/core";
import PurchaseOrderLoansView from "components/Loans/PurchaseOrderLoansView";
import {
  LoanTypeEnum,
  useLoansByCompanyAndLoanTypeForCustomerQuery,
} from "generated/graphql";
import useCompanyContext from "hooks/useCompanyContext";

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

  const loanType = "purchase_order";
  if (loanType === "purchase_order") {
    return (
      <Box flex={1} display="flex">
        <PurchaseOrderLoansView
          isDataLoading={isLoansLoading}
          purchaseOrderLoans={purchaseOrderLoans}
          refetch={refetch}
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
