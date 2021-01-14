import { Button } from "@material-ui/core";
import ConfirmModal from "components/Shared/Confirmations/ConfirmModal";
import { ContactFragment } from "generated/graphql";
import { sendNotification } from "lib/notifications/sendUpdate";
import { useState } from "react";

interface Props {
  contacts: Array<ContactFragment>;
}

function SendVendorAgreements(props: Props) {
  const [open, setOpen] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  if (!props.contacts || props.contacts.length === 0) {
    return (
      <div>
        Cannot send Notifications, because no users are setup for this vendor.
      </div>
    );
  }

  const recipients = props.contacts.map((contact) => {
    return { email: contact.email };
  });

  return (
    <>
      {open && (
        <ConfirmModal
          title="Would you like to send the vendor sign-up email?"
          errMsg={errMsg}
          handleConfirm={async () => {
            const resp = await sendNotification({
              type: "email",
              template_id: "vendor_agreement_signup",
              recipients: recipients,
            });

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
        Send Vendor Sign-up email
      </Button>
    </>
  );
}

export default SendVendorAgreements;
