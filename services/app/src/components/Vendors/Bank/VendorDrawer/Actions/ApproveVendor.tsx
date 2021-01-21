import { Button } from "@material-ui/core";
import ConfirmModal from "components/Shared/Confirmations/ConfirmModal";
import {
  notifyTemplates,
  sendNotification,
} from "lib/notifications/sendUpdate";
import { useState } from "react";

interface Props {
  vendorPartnershipId: string;
  vendorName: string;
  customerName: string;
}

function ApproveVendor(props: Props) {
  const [open, setOpen] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  /*
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
  
    */
  const recipients: any = [];
  const customerName = props.customerName;

  return (
    <>
      {open && (
        <ConfirmModal
          title={`Would you like to approve vendor ${props.vendorName} for customer ${customerName}?`}
          errMsg={errMsg}
          handleConfirm={async () => {
            // TODO(dlluncor): Update approved_at and then send the correct notification type
            const resp = await sendNotification({
              type: "email",
              template_config: notifyTemplates.VENDOR_AGREEMENT_WITH_CUSTOMER,
              template_data: {
                customer_name: customerName,
              },
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
        Approve vendor
      </Button>
    </>
  );
}

export default ApproveVendor;
