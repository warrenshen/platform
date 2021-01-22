import { Button } from "@material-ui/core";
import ConfirmModal from "components/Shared/Confirmations/ConfirmModal";
import { ContactFragment } from "generated/graphql";
import { InventoryNotifier } from "lib/notifications/inventory";
import { useState } from "react";

interface Props {
  vendorContact: ContactFragment | null;
  customerName: string;
  vendorName: string;
  docusignLink: string;
  notifier: InventoryNotifier;
}

function SendVendorAgreements(props: Props) {
  const [open, setOpen] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  if (!props.vendorContact) {
    return (
      <div>
        Cannot send Notifications, because no primary user setup for this
        vendor.
      </div>
    );
  }

  const customerName = props.customerName;
  const recipients = [{ email: props.vendorContact.email }];

  return (
    <>
      {open && (
        <ConfirmModal
          title={`Would you like to send the vendor agreement email to ${props.vendorName} for customer ${customerName}?`}
          errMsg={errMsg}
          handleConfirm={async () => {
            const resp = await props.notifier.sendVendorAgreementWithCustomer(
              {
                customer_name: customerName,
                docusign_link: props.docusignLink,
              },
              recipients
            );

            if (resp.status !== "OK") {
              setErrMsg("Could not send email. Error: " + resp.msg);
              return;
            }
            setOpen(false);
          }}
          handleClose={() => setOpen(false)}
        ></ConfirmModal>
      )}
      <Button
        size="small"
        variant="contained"
        color="primary"
        onClick={() => {
          setOpen(true);
        }}
      >
        Send Vendor agreement email
      </Button>
    </>
  );
}

export default SendVendorAgreements;
