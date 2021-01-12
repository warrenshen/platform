import { Button } from "@material-ui/core";
import PaymentModal from "components/Shared/Payments/PaymentModal";
import { PaymentTransferDirection } from "components/Shared/BankToBankTransfer";
import { Companies } from "generated/graphql";
import { useState } from "react";

function DisbursalButton(props: { vendorId: Companies["id"] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {open && (
        <PaymentModal
          companyId={props.vendorId}
          direction={PaymentTransferDirection.FromBank}
          handleClose={() => setOpen(false)}
        ></PaymentModal>
      )}
      <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
        Make an advance
      </Button>
    </>
  );
}

export default DisbursalButton;
