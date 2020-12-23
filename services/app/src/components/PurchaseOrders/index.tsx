import { Box } from "@material-ui/core";
import { CustomerParams } from "components/Bank/Customer";
import AddButton from "components/PurchaseOrders/AddPurchaseOrder/AddButton";
import ListPurchaseOrders from "components/PurchaseOrders/ListPurchaseOrders";
import { CurrentUserContext, UserRole } from "contexts/CurrentUserContext";
import { PurchaseOrderFragment } from "generated/graphql";
import { Maybe } from "graphql/jsutils/Maybe";
import useAppBarTitle from "hooks/useAppBarTitle";
import { useContext, useState } from "react";
import { useParams } from "react-router-dom";
import { useTitle } from "react-use";
import { ActionType } from "../../lib/ActionType";

function PurchaseOrders() {
  const { companyId } = useParams<CustomerParams>();
  const { role: currentUserRole } = useContext(CurrentUserContext);
  useTitle("Purchase Orders | Bespoke");
  useAppBarTitle("Purchase Orders");

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
      {currentUserRole === UserRole.Customer && (
        <AddButton
          actionType={actionType}
          originalPurchaseOrder={originalPurchaseOrder}
          open={open}
          setOpen={setOpen}
          manipulatePurchaseOrder={manipulatePurchaseOrder}
          clearId={clearId}
        ></AddButton>
      )}
      <ListPurchaseOrders
        companyId={companyId}
        manipulatePurchaseOrder={manipulatePurchaseOrder}
      ></ListPurchaseOrders>
    </Box>
  );
}

export default PurchaseOrders;
