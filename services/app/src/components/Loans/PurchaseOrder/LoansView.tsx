import { Box } from "@material-ui/core";
import Can from "components/Can";
import AddButton from "components/Loans/PurchaseOrder/AddLoan/AddButton";
import ListLoans from "components/Loans/PurchaseOrder/ListLoans";
import useAppBarTitle from "hooks/useAppBarTitle";
import { Action } from "lib/rbac-rules";
import { useState } from "react";
import { useTitle } from "react-use";

function LoansView() {
  /* 
  const { companyId } = useParams<CustomerParams>();
   const {
    user: { role },
  } = useContext(CurrentUserContext);
*/
  useTitle("Loans | Bespoke");
  useAppBarTitle("Loans");

  const [open, setOpen] = useState(false);
  return (
    <>
      <Box pb={2} display="flex" flexDirection="row-reverse">
        <Can perform={Action.AddPurchaseOrders}>
          <AddButton open={open} setOpen={setOpen}></AddButton>
        </Can>
      </Box>
      <ListLoans></ListLoans>
    </>
  );
}

export default LoansView;
