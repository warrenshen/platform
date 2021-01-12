import { IconButton } from "@material-ui/core";
import { LaunchOutlined } from "@material-ui/icons";
import PurchaseOrderLoanDrawer from "components/Shared/PurchaseOrderLoanDrawer";
import { PurchaseOrderLoans } from "generated/graphql";
import React, { useState } from "react";

function Launcher(props: { purchaseOrderLoanId: PurchaseOrderLoans["id"] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <PurchaseOrderLoanDrawer
          onClose={() => setOpen(false)}
          purchaseOrderLoanId={props.purchaseOrderLoanId}
        ></PurchaseOrderLoanDrawer>
      )}
      <IconButton onClick={() => setOpen(true)}>
        <LaunchOutlined></LaunchOutlined>
      </IconButton>
    </>
  );
}

export default Launcher;
