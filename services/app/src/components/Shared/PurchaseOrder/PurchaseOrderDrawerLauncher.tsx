import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
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
      <ClickableDataGridCell onClick={() => setIsOpen(true)} label={label} />
    </>
  );
}

export default Launcher;
