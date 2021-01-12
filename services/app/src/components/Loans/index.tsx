import { Box } from "@material-ui/core";
import PurchaseOrderLoansView from "components/Loans/PurchaseOrder/LoansView";

// For now, loans will allow you to view 1 of the loan views, e.g., Purchase Order Loans,
// Inventory Financing, etc.
function Loans() {
  /* 
  const { companyId } = useParams<CustomerParams>();
   const {
    user: { role },
  } = useContext(CurrentUserContext);
*/
  const loanType = "purchase_order";
  if (loanType === "purchase_order") {
    return <PurchaseOrderLoansView />;
  }

  return (
    <>
      <Box pb={2} display="flex" flexDirection="row-reverse">
        Nothing to display
      </Box>
    </>
  );
}

export default Loans;
