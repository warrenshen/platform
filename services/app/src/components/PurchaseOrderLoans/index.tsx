import { Box } from "@material-ui/core";
import PurchaseOrderLoansView from "components/PurchaseOrderLoans/PurchaseOrderLoansView";
import { usePurchaseOrderLoansForCustomerQuery } from "generated/graphql";
import useCompanyContext from "hooks/useCompanyContext";

// For now, loans will allow you to view 1 of the loan views, e.g., Purchase Order Loans,
// Inventory Financing, etc.
function Loans() {
  const companyId = useCompanyContext();

  const { data, refetch, error } = usePurchaseOrderLoansForCustomerQuery({
    variables: {
      companyId,
    },
  });
  if (error) {
    alert("Error querying purchase orders. " + error);
  }

  const purchaseOrderLoans = data?.purchase_order_loans || [];

  const loanType = "purchase_order";
  if (loanType === "purchase_order") {
    return (
      <PurchaseOrderLoansView
        purchaseOrderLoans={purchaseOrderLoans}
        refetch={refetch}
      ></PurchaseOrderLoansView>
    );
  }

  return (
    <Box pb={2} display="flex" flexDirection="row-reverse">
      Nothing to display
    </Box>
  );
}

export default Loans;
