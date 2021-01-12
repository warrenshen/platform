import { Box } from "@material-ui/core";
import Can from "components/Can";
import AddButton from "components/Shared/PurchaseOrders/AddPurchaseOrder/AddButton";
import ListPurchaseOrders from "components/Shared/PurchaseOrders/ListPurchaseOrders";
//import { CurrentUserContext } from "contexts/CurrentUserContext";
import { PurchaseOrderFragment } from "generated/graphql";
import { Maybe } from "graphql/jsutils/Maybe";
import { ActionType } from "lib/ActionType";
import { Action } from "lib/rbac-rules";
import { CustomerParams } from "pages/Bank/Customer";
import { useState } from "react";
import { useParams } from "react-router-dom";

function PurchaseOrders() {
  const { companyId } = useParams<CustomerParams>();

  const clearId = () => {
    setOriginalPurchaseOrder(null);
  };
  const manipulatePurchaseOrder = (
    actionType: ActionType,
    value: Maybe<PurchaseOrderFragment>
  ) => {
    setActionType(actionType);
    setOriginalPurchaseOrder(value);
    setOpen(true);
  };

  const [open, setOpen] = useState(false);
  const [originalPurchaseOrder, setOriginalPurchaseOrder] = useState<
    Maybe<PurchaseOrderFragment>
  >(null);
  const [actionType, setActionType] = useState(ActionType.New);
  return (
    <>
      <Box pb={2} display="flex" flexDirection="row-reverse">
        <Can perform={Action.AddPurchaseOrders}>
          <AddButton
            actionType={actionType}
            originalPurchaseOrder={originalPurchaseOrder}
            open={open}
            setOpen={setOpen}
            manipulatePurchaseOrder={manipulatePurchaseOrder}
            clearId={clearId}
          ></AddButton>
        </Can>
      </Box>
      <ListPurchaseOrders
        companyId={companyId}
        manipulatePurchaseOrder={manipulatePurchaseOrder}
      ></ListPurchaseOrders>
    </>
  );
}

export default PurchaseOrders;
