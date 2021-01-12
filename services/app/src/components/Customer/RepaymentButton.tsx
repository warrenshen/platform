import { Button } from "@material-ui/core";
import PaymentModal from "components/Shared/Payments/PaymentModal";
import { PaymentTransferDirection } from "components/Shared/BankToBankTransfer";
import useCompanyContext from "hooks/useCustomerContext";
import { useState } from "react";

function RepaymentButton() {
  const companyId = useCompanyContext();
  const [open, setOpen] = useState(false);
  return (
    <>
      {open && (
        <PaymentModal
          companyId={companyId}
          direction={PaymentTransferDirection.ToBank}
          handleClose={() => setOpen(false)}
        ></PaymentModal>
      )}
      <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
        Make a Payment
      </Button>
    </>
  );
}

export default RepaymentButton;
