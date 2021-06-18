import { Button } from "@material-ui/core";
import ConfirmModal from "components/Shared/Confirmations/ConfirmModal";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { approvePartnershipMutation } from "lib/api/companies";
import { InventoryNotifier } from "lib/notifications/inventory";
import { useState } from "react";

interface Props {
  hasNoCollectionsBankAccount: boolean;
  hasNoContactsSetup: boolean;
  payorPartnershipId: string;
  payorId: string;
  payorName: string;
  customerId: string;
  customerName: string;
  notifier: InventoryNotifier;
}

export default function ApprovePayor({
  hasNoCollectionsBankAccount,
  hasNoContactsSetup,
  payorPartnershipId,
  payorId,
  payorName,
  customerId,
  customerName,
  notifier,
}: Props) {
  const snackbar = useSnackbar();

  const [open, setOpen] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const [
    approvePartnership,
    { loading: isApprovePartnershipLoading },
  ] = useCustomMutation(approvePartnershipMutation);

  if (hasNoContactsSetup) {
    return (
      <div>
        Cannot send Notifications, because no primary user setup for the payor
        and customer.
      </div>
    );
  }

  const arePayorDetailsValid = () => {
    if (hasNoContactsSetup) {
      snackbar.showError("Payor does not have any users setup");
      return false;
    }
    if (hasNoCollectionsBankAccount) {
      snackbar.showError(
        "Payor does not have a collections bank account assigned to it yet"
      );
      return false;
    }
    return true;
  };

  const handleClickSubmit = async () => {
    let isValid = arePayorDetailsValid();

    if (!isValid) {
      setOpen(false);
      return;
    }

    const response = await approvePartnership({
      variables: {
        partnership_id: payorPartnershipId,
        is_payor: true,
      },
    });

    if (response.status !== "OK") {
      snackbar.showError(
        `Could not approve partnership. Error: ${response.msg}`
      );
      return;
    }

    const resp = await notifier.sendPayorApproved({
      payor_id: payorId,
      company_id: customerId,
    });

    if (resp.status !== "OK") {
      setErrMsg(
        "Could not send notify payor approved, notify customer email. Error: " +
          resp.msg
      );
      return;
    } else {
      snackbar.showSuccess("Payor approved.");
      setOpen(false);
    }
  };

  return (
    <>
      {open && (
        <ConfirmModal
          title={`Would you like to approve payor ${payorName} for customer ${customerName}?`}
          errorMessage={errMsg}
          handleClose={() => setOpen(false)}
          handleConfirm={handleClickSubmit}
        />
      )}
      <Button
        disabled={isApprovePartnershipLoading}
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
