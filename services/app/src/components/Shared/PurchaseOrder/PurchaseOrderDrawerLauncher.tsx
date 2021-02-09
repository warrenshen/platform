import { Button } from "@material-ui/core";
import PurchaseOrderDrawer from "components/Shared/PurchaseOrder/PurchaseOrderDrawer";
import { PurchaseOrders } from "generated/graphql";
import React, { useState } from "react";

interface Props {
  label: string;
  purchaseOrderId: PurchaseOrders["id"];
}

function Launcher({ label, purchaseOrderId }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {isOpen && (
        <PurchaseOrderDrawer
          purchaseOrderId={purchaseOrderId}
          handleClose={() => setIsOpen(false)}
        ></PurchaseOrderDrawer>
      )}
      <Button color="primary" onClick={() => setIsOpen(true)}>
        {label}
      </Button>
    </>
  );
}

export default Launcher;
