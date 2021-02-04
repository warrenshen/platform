import { Button } from "@material-ui/core";
import { Companies, PurchaseOrderLoans } from "generated/graphql";
import { useState } from "react";

function DisbursalButton(props: {
  vendorId: Companies["id"];
  purchaseOrderLoanId: PurchaseOrderLoans["id"];
  initialAmount: number;
}) {
  const [open, setOpen] = useState(false);

  /*
  <PaymentModal
          companyId={props.vendorId}
          type={PaymentTransferType.FromBank}
          initialAmount={props.initialAmount}
          errMsg=""
          allowablePaymentTypes={[
            PaymentMethod.None,
            PaymentMethod.ACH,
            PaymentMethod.Wire,
          ]}
          handleClose={() => setOpen(false)}
          onCreate={async (payment: PaymentsInsertInput) => {
            window.console.log("TODO: submit disbursement");
            /*
            await submitDisbursement({
              variables: {
                purchaseOrderLoanId: props.purchaseOrderLoanId,
                transaction: {
                  ...transaction,
                  submitted_at: new Date(Date.now()),
                  settled_at: new Date(
                    new Date().getTime() + 3 * 24 * 60 * 60 * 1000
                  ),
                },
              },
            });
           setOpen(false);
          }}
          coverageComponent={(amount: number) => (
            <DisbursalCoverage
              amount={amount}
              purchaseOrderLoanId={props.purchaseOrderLoanId}
            ></DisbursalCoverage>
          )}
        ></PaymentModal>
  */

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
