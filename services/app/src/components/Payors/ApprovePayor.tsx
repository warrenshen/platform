import { Button } from "@material-ui/core";
import ConfirmModal from "components/Shared/Confirmations/ConfirmModal";
import { useUpdateCompanyPayorPartnershipApprovedAtMutation } from "generated/graphql";
import { InventoryNotifier } from "lib/notifications/inventory";
import { useState } from "react";

interface Props {
  hasNoContactsSetup: boolean;
  payorPartnershipId: string;
  payorId: string;
  payorName: string;
  customerId: string;
  customerName: string;
  notifier: InventoryNotifier;
}

export default function ApprovePayor({
  hasNoContactsSetup,
  payorPartnershipId,
  payorId,
  payorName,
  customerId,
  customerName,
  notifier,
}: Props) {
  const [open, setOpen] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const [
    updateApprovedAt,
  ] = useUpdateCompanyPayorPartnershipApprovedAtMutation();

  if (hasNoContactsSetup) {
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
          title={`Would you like to approve payor ${payorName} for customer ${customerName}?`}
          errorMessage={errMsg}
          handleClose={() => setOpen(false)}
          handleConfirm={async () => {
            updateApprovedAt({
              variables: {
                companyPayorPartnershipId: payorPartnershipId,
                approvedAt: "now()",
              },
            });

            let resp = await notifier.sendPayorApproved({
              payor_id: payorId,
              company_id: customerId,
            });

            if (resp.status !== "OK") {
              setErrMsg(
                "Could not send notify payor approved, notify customer email. Error: " +
                  resp.msg
              );
              return;
            }

            setOpen(false);
          }}
        />
      )}
      <Button
        size="small"
        variant="contained"
        color="primary"
        onClick={() => {
          setOpen(true);
        }}
      >
        Approve payor
      </Button>
    </>
  );
}
