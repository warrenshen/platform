import { Box } from "@material-ui/core";
import AddButton from "components/PurchaseOrders/AddPurchaseOrder/AddButton";
import ListPurchaseOrders from "components/PurchaseOrders/ListPurchaseOrders";
import { PageContext } from "contexts/PageContext";
import { PurchaseOrderFragment } from "generated/graphql";
import { Maybe } from "graphql/jsutils/Maybe";
import { useContext, useEffect, useState } from "react";
import { useTitle } from "react-use";
import { ActionType } from "./models/ActionType";

function PurchaseOrders() {
  useTitle("Purchase Orders | Bespoke");
  const pageContext = useContext(PageContext);

  useEffect(() => {
    pageContext.setAppBarTitle("Purchase Orders");
  }, []);

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
    <Box>
      <AddButton
        actionType={actionType}
        originalPurchaseOrder={originalPurchaseOrder}
        open={open}
        setOpen={setOpen}
        manipulatePurchaseOrder={manipulatePurchaseOrder}
        clearId={clearId}
      ></AddButton>
      <ListPurchaseOrders
        manipulatePurchaseOrder={manipulatePurchaseOrder}
      ></ListPurchaseOrders>
    </Box>
  );
}

export default PurchaseOrders;
