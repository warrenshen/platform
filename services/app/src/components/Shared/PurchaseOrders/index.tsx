import { Box } from "@material-ui/core";
import Can from "components/Shared/Can";
import AddPurchaseOrderButton from "components/Shared/PurchaseOrders/AddPurchaseOrder/AddPurchaseOrderButton";
import ListPurchaseOrders from "components/Shared/PurchaseOrders/ListPurchaseOrders";
import { Action } from "lib/auth/rbac-rules";
import { CustomerParams } from "pages/Bank/Customer";
import { useParams } from "react-router-dom";

function PurchaseOrders() {
  const { companyId } = useParams<CustomerParams>();

  return (
    <>
      <Box pb={2} display="flex" flexDirection="row-reverse">
        <Can perform={Action.AddPurchaseOrders}>
          <AddPurchaseOrderButton></AddPurchaseOrderButton>
        </Can>
      </Box>
      <ListPurchaseOrders companyId={companyId}></ListPurchaseOrders>
    </>
  );
}

export default PurchaseOrders;
