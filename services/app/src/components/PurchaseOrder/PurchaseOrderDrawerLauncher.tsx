import PurchaseOrderDrawer from "components/PurchaseOrder/PurchaseOrderDrawer";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
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
        />
      )}
      <ClickableDataGridCell onClick={() => setIsOpen(true)} label={label} />
    </>
  );
}

export default Launcher;
