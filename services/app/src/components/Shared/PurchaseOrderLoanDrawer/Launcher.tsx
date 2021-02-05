import { IconButton } from "@material-ui/core";
import { LaunchOutlined } from "@material-ui/icons";
import PurchaseOrderLoanDrawer from "components/Shared/PurchaseOrderLoanDrawer";
import { PurchaseOrderLoans } from "generated/graphql";
import React, { useState } from "react";

function Launcher(props: { purchaseOrderLoanId: PurchaseOrderLoans["id"] }) {
  const [open, setOpen] = useState(false);

  // TODO (warrenshen): do not do the manual typecast below.
  return (
    <>
      {open && (
        <PurchaseOrderLoanDrawer
          onClose={() => setOpen(false)}
          loanId={props.purchaseOrderLoanId as string}
        ></PurchaseOrderLoanDrawer>
      )}
      <IconButton onClick={() => setOpen(true)}>
        <LaunchOutlined></LaunchOutlined>
      </IconButton>
    </>
  );
}

export default Launcher;
