import { Button } from "@material-ui/core";
import ConfirmModal from "components/Shared/Confirmations/ConfirmModal";
import { useUpdateCompanyVendorPartnershipApprovedAtMutation } from "generated/graphql";
import { InventoryNotifier } from "lib/notifications/inventory";
import { useState } from "react";

interface Props {
  hasNoContactsSetup: boolean;
  vendorPartnershipId: string;
  vendorId: string;
  vendorName: string;
  customerId: string;
  customerName: string;
  notifier: InventoryNotifier;
}

function ApproveVendor(props: Props) {
  const [open, setOpen] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const [
    updateApprovedAt,
  ] = useUpdateCompanyVendorPartnershipApprovedAtMutation();

  const customerName = props.customerName;

  if (props.hasNoContactsSetup) {
    return (
      <div>
        Cannot send Notifications, because no primary user setup for the vendor
        and customer.
      </div>
    );
  }

  return (
    <>
      {open && (
        <ConfirmModal
          title={`Would you like to approve vendor ${props.vendorName} for customer ${customerName}?`}
          errMsg={errMsg}
          handleConfirm={async () => {
            updateApprovedAt({
              variables: {
                companyVendorPartnershipId: props.vendorPartnershipId,
                approvedAt: "now()",
              },
            });

            let resp = await props.notifier.sendVendorApproved({
              vendor_id: props.vendorId,
              company_id: props.customerId,
            });

            if (resp.status !== "OK") {
              setErrMsg(
                "Could not send notify vendor approved, notify customer email. Error: " +
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
