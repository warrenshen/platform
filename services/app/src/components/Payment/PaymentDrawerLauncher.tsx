import PaymentDrawer from "components/Payment/PaymentDrawer";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import { PurchaseOrders } from "generated/graphql";
import { truncateUuid } from "lib/uuid";
import { useState } from "react";

interface Props {
  paymentId: PurchaseOrders["id"];
}

function Launcher({ paymentId }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {isOpen && (
        <PaymentDrawer
          paymentId={paymentId}
          handleClose={() => setIsOpen(false)}
        />
      )}
      <ClickableDataGridCell
        onClick={() => setIsOpen(true)}
        label={truncateUuid(paymentId)}
      />
    </>
  );
}

export default Launcher;
