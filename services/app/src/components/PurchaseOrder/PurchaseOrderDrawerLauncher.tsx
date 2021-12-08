import { Box, Tooltip } from "@material-ui/core";
import PurchaseOrderDrawer from "components/PurchaseOrder/PurchaseOrderDrawer";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import MetrcLogo from "components/Shared/Images/MetrcLogo.png";
import { PurchaseOrders } from "generated/graphql";
import { useState } from "react";

interface Props {
  label: string;
  isMetrcBased: boolean;
  purchaseOrderId: PurchaseOrders["id"];
}

export default function PurchaseOrderDrawerLauncher({
  label,
  isMetrcBased,
  purchaseOrderId,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Box display="flex" alignItems="center">
      {isOpen && (
        <PurchaseOrderDrawer
          purchaseOrderId={purchaseOrderId}
          handleClose={() => setIsOpen(false)}
        />
      )}
      <ClickableDataGridCell onClick={() => setIsOpen(true)} label={label} />
      {isMetrcBased && (
        <Tooltip
          arrow
          interactive
          title={"Purchase order created from Metrc manifest"}
        >
          <img src={MetrcLogo} alt="Metrc Logo" width={24} height={24} />
        </Tooltip>
      )}
    </Box>
  );
}
