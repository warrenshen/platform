import { Button } from "@material-ui/core";
import ConfirmModal from "components/Shared/Confirmations/ConfirmModal";
import {
  ContactFragment,
  useUpdateCompanyVendorPartnershipApprovedAtMutation,
} from "generated/graphql";
import { nowStr } from "lib/dates/dateUtil";
import { InventoryNotifier } from "lib/notifications/inventory";
import { useState } from "react";

interface Props {
  vendorPartnershipId: string;
  customerContact: ContactFragment | null;
  vendorContact: ContactFragment | null;
  vendorName: string;
  customerName: string;
  notifier: InventoryNotifier;
}

function ApproveVendor(props: Props) {
  const [open, setOpen] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const [
    updateApprovedAt,
  ] = useUpdateCompanyVendorPartnershipApprovedAtMutation();

  if (!props.vendorContact || !props.customerContact) {
    return (
      <div>
        Cannot send Notifications, because no primary user setup for the vendor
        and customer.
      </div>
    );
  }

  const customerName = props.customerName;
  const customerRecipients = [{ email: props.customerContact.email }];
  const vendorRecipients = [{ email: props.vendorContact.email }];

  return (
    <>
      {open && (
        <ConfirmModal
          title={`Would you like to approve vendor ${props.vendorName} for customer ${customerName}?`}
          errMsg={errMsg}
          handleConfirm={async () => {
            const value = new Date();
            updateApprovedAt({
              variables: {
                companyVendorPartnershipId: props.vendorPartnershipId,
                approvedAt: nowStr(),
              },
            });

            let resp = await props.notifier.sendVendorApprovedNotifyCustomer(
              {
                vendor_name: props.vendorName,
              },
              customerRecipients
            );

            if (resp.status !== "OK") {
              setErrMsg(
                "Could not send notify vendor approved, notify customer email. Error: " +
                  resp.msg
              );
              return;
            }

            resp = await props.notifier.sendVendorApprovedNotifyVendor(
              {
                vendor_name: props.vendorName,
                customer_name: props.customerName,
              },
              vendorRecipients
            );

            if (resp.status !== "OK") {
              setErrMsg(
                "Could not send notify vendor approved, notify vendor email. Error: " +
                  resp.msg
              );
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
