import PurchaseOrderLoanDrawer from "components/Shared/PurchaseOrderLoanDrawer";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import { PurchaseOrderLoans, PurchaseOrders } from "generated/graphql";
import React, { useState } from "react";

interface Props {
  purchaseOrderLoanId: PurchaseOrderLoans["id"];
  purchaseOrderNumber: PurchaseOrders["order_number"];
}

function BankPurchaseOrderNumberCell({
  purchaseOrderLoanId,
  purchaseOrderNumber,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <PurchaseOrderLoanDrawer
          onClose={() => setOpen(false)}
          purchaseOrderLoanId={purchaseOrderLoanId}
        ></PurchaseOrderLoanDrawer>
      )}
      <ClickableDataGridCell
        label={purchaseOrderNumber}
        onClick={() => setOpen(true)}
      />
    </>
  );
}

export default BankPurchaseOrderNumberCell;
