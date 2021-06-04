import { Box } from "@material-ui/core";
import PurchaseOrderDrawer from "components/PurchaseOrder/PurchaseOrderDrawer";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import { PurchaseOrders } from "generated/graphql";
import { useState } from "react";

interface Props {
  label: string;
  purchaseOrderId: PurchaseOrders["id"];
}

export default function PurchaseOrderDrawerLauncher({
  label,
  purchaseOrderId,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Box>
      {isOpen && (
        <PurchaseOrderDrawer
          purchaseOrderId={purchaseOrderId}
          handleClose={() => setIsOpen(false)}
        />
      )}
      <ClickableDataGridCell onClick={() => setIsOpen(true)} label={label} />
    </Box>
  );
}
