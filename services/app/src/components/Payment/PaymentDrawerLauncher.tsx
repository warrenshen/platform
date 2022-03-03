import { Box } from "@material-ui/core";
import PaymentDrawer from "components/Payment/PaymentDrawer";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import { PurchaseOrders } from "generated/graphql";
import { useState } from "react";

interface Props {
  label?: string;
  showBankInfo?: boolean;
  paymentId: PurchaseOrders["id"];
}

export default function PaymentDrawerLauncher({
  label,
  paymentId,
  showBankInfo = false,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Box>
      {isOpen && (
        <PaymentDrawer
          paymentId={paymentId}
          handleClose={() => setIsOpen(false)}
          showBankInfo={showBankInfo}
        />
      )}
      <ClickableDataGridCell
        onClick={() => setIsOpen(true)}
        label={label || paymentId}
      />
    </Box>
  );
}
