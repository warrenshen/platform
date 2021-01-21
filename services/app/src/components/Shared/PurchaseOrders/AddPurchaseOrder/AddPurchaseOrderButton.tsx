import { Button } from "@material-ui/core";
import CreateUpdatePurchaseOrderModal from "components/Shared/PurchaseOrders/CreateUpdatePurchaseOrderModal";
import { ActionType } from "lib/ActionType";
import { useState } from "react";

function AddPurchaseOrderButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <CreateUpdatePurchaseOrderModal
          actionType={ActionType.New}
          handleClose={() => setOpen(false)}
        ></CreateUpdatePurchaseOrderModal>
      )}
      <Button onClick={() => setOpen(true)} variant="contained" color="primary">
        Add Purchase Order
      </Button>
    </>
  );
}

export default AddPurchaseOrderButton;
