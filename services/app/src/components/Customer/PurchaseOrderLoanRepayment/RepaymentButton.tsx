import { Button } from "@material-ui/core";
import { PaymentTransferType } from "components/Shared/BankToBankTransfer";
import PaymentModal from "components/Shared/Payments/PaymentModal";
import { PaymentsInsertInput } from "generated/graphql";
import useCompanyContext from "hooks/useCompanyContext";
import {
  calculateEffectOfPayment,
  makePayment,
} from "lib/finance/transactions/purchaseOrderLoans";
import { useState } from "react";

function RepaymentButton() {
  const companyId = useCompanyContext();
  const [open, setOpen] = useState(false);
  return (
    <>
      {open && (
        <PaymentModal
          companyId={companyId}
          type={PaymentTransferType.ToBank}
          handleClose={() => setOpen(false)}
          onCreate={async (payment: PaymentsInsertInput) => {
            window.console.log(payment);
            const resp = await makePayment({ payment: payment });
            console.log(resp);
          }}
          onCalculateEffectOfPayment={async (payment: PaymentsInsertInput) => {
            window.console.log(payment);
            const resp = await calculateEffectOfPayment({ payment: payment });
            console.log(resp);
          }}
          coverageComponent={(amount: number) => (
            <div></div>
            //<RepaymentCoverage amount={amount}></RepaymentCoverage>
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
