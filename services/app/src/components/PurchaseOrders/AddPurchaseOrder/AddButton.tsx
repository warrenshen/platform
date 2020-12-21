import { Button } from "@material-ui/core";
import { PurchaseOrderFragment } from "generated/graphql";
import { Maybe } from "graphql/jsutils/Maybe";
import { ActionType } from "../../../lib/ActionType";
import AddPurchaseOrderModal from "./AddPurchaseOrderModal";

interface Props {
  actionType: ActionType;
  originalPurchaseOrder: Maybe<PurchaseOrderFragment>;
  open: boolean;
  setOpen: (arg0: boolean) => void;
  manipulatePurchaseOrder: (
    actionType: ActionType,
    purchaseOrder: Maybe<PurchaseOrderFragment>
  ) => void;
  clearId: () => void;
}

function AddButton({
  actionType,
  originalPurchaseOrder,
  open,
  setOpen,
  manipulatePurchaseOrder,
  clearId,
}: Props) {
  return (
    <>
      {open && (
        <AddPurchaseOrderModal
          actionType={actionType}
          originalPurchaseOrder={originalPurchaseOrder}
          handleClose={() => setOpen(false)}
        ></AddPurchaseOrderModal>
      )}
      <Button
        onClick={() => {
          clearId();
          manipulatePurchaseOrder(ActionType.New, null);
          setOpen(true);
        }}
        color="primary"
      >
        Add Purchase Order
      </Button>
    </>
  );
}

export default AddButton;
