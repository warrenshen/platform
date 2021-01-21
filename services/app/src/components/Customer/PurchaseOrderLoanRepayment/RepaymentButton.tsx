import { Button } from "@material-ui/core";
import RepaymentCoverage from "components/Customer/PurchaseOrderLoanRepayment/RepaymentCoverage";
import { PaymentTransferDirection } from "components/Shared/BankToBankTransfer";
import PaymentModal from "components/Shared/Payments/PaymentModal";
import useCompanyContext from "hooks/useCompanyContext";
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
          coverageComponent={(amount: number) => (
            <RepaymentCoverage amount={amount}></RepaymentCoverage>
          )}
        ></PaymentModal>
      )}
      <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
        Make a Payment
      </Button>
    </>
  );
}

export default RepaymentButton;
