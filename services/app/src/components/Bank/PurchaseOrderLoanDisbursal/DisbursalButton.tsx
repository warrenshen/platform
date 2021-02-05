import { Button } from "@material-ui/core";
import { Companies, PurchaseOrderLoans } from "generated/graphql";
import { useState } from "react";

function DisbursalButton(props: {
  vendorId: Companies["id"];
  purchaseOrderLoanId: PurchaseOrderLoans["id"];
  initialAmount: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && <div>Advances modal</div>}
      <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
        Make an advance
      </Button>
    </>
  );
}

export default DisbursalButton;
