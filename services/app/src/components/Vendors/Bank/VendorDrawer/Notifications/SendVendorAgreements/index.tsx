import { Button } from "@material-ui/core";
import ConfirmModal from "components/Shared/Confirmations/ConfirmModal";
import { InventoryNotifier } from "lib/notifications/inventory";
import { useState } from "react";

interface Props {
  customerName: string;
  customerId: string;
  vendorName: string;
  vendorId: string;
  notifier: InventoryNotifier;
}

function SendVendorAgreements(props: Props) {
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const customerName = props.customerName;

  return (
    <>
      {open && (
        <ConfirmModal
          title={`Would you like to send the vendor agreement email to ${props.vendorName} for customer ${customerName}?`}
          errorMessage={errorMessage}
          handleConfirm={async () => {
            const response = await props.notifier.sendVendorAgreementWithCustomer(
              {
                company_id: props.customerId,
                vendor_id: props.vendorId,
              }
            );

            if (response.status !== "OK") {
              setErrorMessage("Could not send email. Error: " + response.msg);
            } else {
              setErrorMessage("");
              setOpen(false);
            }
          }}
          handleClose={() => setOpen(false)}
        ></ConfirmModal>
      )}
      <Button
        size="small"
        variant="contained"
        color="primary"
        onClick={() => setOpen(true)}
      >
        Send Vendor agreement email
      </Button>
    </>
  );
}

export default SendVendorAgreements;
