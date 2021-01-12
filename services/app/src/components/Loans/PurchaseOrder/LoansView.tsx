import { Box } from "@material-ui/core";
import Can from "components/Can";
import AddButton from "components/Loans/PurchaseOrder/AddLoan/AddButton";
import ListLoans from "components/Loans/PurchaseOrder/ListLoans";
import RepaymentButton from "components/Customer/RepaymentButton";
import { Action } from "lib/rbac-rules";

function LoansView() {
  return (
    <>
      <Box pb={2} display="flex" flexDirection="row-reverse">
        <Can perform={Action.AddPurchaseOrders}>
          <AddButton></AddButton>
        </Can>
        <Can perform={Action.RepayPurchaseOrderLoans}>
          <Box mr={2}>
            <RepaymentButton></RepaymentButton>
          </Box>
        </Can>
      </Box>
      <ListLoans></ListLoans>
    </>
  );
}

export default LoansView;
