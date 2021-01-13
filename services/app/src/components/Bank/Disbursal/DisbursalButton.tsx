import { Button } from "@material-ui/core";
import { PaymentTransferDirection } from "components/Shared/BankToBankTransfer";
import PaymentModal, {
  PaymentType,
} from "components/Shared/Payments/PaymentModal";
import {
  Companies,
  PaymentsInsertInput,
  PurchaseOrderLoans,
  useSubmitDisbursementMutation,
} from "generated/graphql";
import { useState } from "react";

function DisbursalButton(props: {
  vendorId: Companies["id"];
  purchaseOrderLoanId: PurchaseOrderLoans["id"];
}) {
  const [open, setOpen] = useState(false);
  const [submitDisbursement] = useSubmitDisbursementMutation();

  return (
    <>
      {open && (
        <PaymentModal
          companyId={props.vendorId}
          direction={PaymentTransferDirection.FromBank}
          allowablePaymentTypes={[
            PaymentType.None,
            PaymentType.ACH,
            PaymentType.Wire,
          ]}
          handleClose={() => setOpen(false)}
          onCreate={async (payment: PaymentsInsertInput) => {
            await submitDisbursement({
              variables: {
                payment: {
                  ...payment,
                  submitted_at: new Date(Date.now()),
                  settled_at: new Date(
                    new Date().getTime() + 3 * 24 * 60 * 60 * 1000
                  ),
                  resource_type: "purchase_order_loans",
                  resource_id: props.purchaseOrderLoanId,
                },
              },
            });
            setOpen(false);
          }}
        ></PaymentModal>
      )}
      <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
        Make an advance
      </Button>
    </>
  );
}

export default DisbursalButton;
