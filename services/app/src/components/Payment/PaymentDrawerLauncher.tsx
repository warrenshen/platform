import { Box } from "@material-ui/core";
import PaymentDrawer from "components/Payment/PaymentDrawer";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import { PurchaseOrders } from "generated/graphql";
import { useState } from "react";

interface Props {
  label?: string;
  paymentId: PurchaseOrders["id"];
}

export default function PaymentDrawerLauncher({ label, paymentId }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Box>
      {isOpen && (
        <PaymentDrawer
          paymentId={paymentId}
          handleClose={() => setIsOpen(false)}
        />
      )}
      <ClickableDataGridCell
        onClick={() => setIsOpen(true)}
        label={label || paymentId}
      />
    </Box>
  );
}
