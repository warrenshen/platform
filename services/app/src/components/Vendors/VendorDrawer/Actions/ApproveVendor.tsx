import { Button } from "@material-ui/core";
import * as Sentry from "@sentry/react";
import ConfirmModal from "components/Shared/Confirmations/ConfirmModal";
import {
  useGetVendorPartnershipForBankQuery,
  useUpdateCompanyVendorPartnershipApprovedAtMutation,
} from "generated/graphql";
import useSnackbar from "hooks/useSnackbar";
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
  const snackbar = useSnackbar();

  const [open, setOpen] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const [
    updateApprovedAt,
  ] = useUpdateCompanyVendorPartnershipApprovedAtMutation();

  const vendorPartnershipId = props.vendorPartnershipId;

  const {
    data,
    loading: isBankVendorPartnershipLoading,
    error,
    refetch,
  } = useGetVendorPartnershipForBankQuery({
    fetchPolicy: "network-only",
    variables: {
      id: vendorPartnershipId,
    },
  });

  if (!data?.company_vendor_partnerships_by_pk) {
    if (!isBankVendorPartnershipLoading) {
      let msg = `Error querying for the bank vendor partner ${vendorPartnershipId}. Error: ${error}`;
      window.console.log(msg);
      Sentry.captureMessage(msg);
    }
    return null;
  }

  const companyVendorPartnership = data.company_vendor_partnerships_by_pk;
  const vendor = companyVendorPartnership.vendor;
  const customerName = props.customerName;

  if (props.hasNoContactsSetup) {
    return (
      <div>
        Cannot send Notifications, because no primary user setup for the vendor
        and customer.
      </div>
    );
  }

  const areVendorDetailsValid = () => {
    if (vendor.users.length <= 0) {
      snackbar.showError("Vendor does not have any users setup");
      return false;
    }
    if (!companyVendorPartnership.vendor_bank_id) {
      snackbar.showError(
        "Vendor does not have a bank account setup for Bespoke Financial to send advances to"
      );
      return false;
    }
    return true;
  };

  const handleClickSubmit = async () => {
    let isValid = areVendorDetailsValid();

    if (!isValid) {
      setOpen(false);
      return;
    }

    updateApprovedAt({
      variables: {
        companyVendorPartnershipId: vendorPartnershipId,
        approvedAt: "now()",
      },
    });

    refetch();

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
    } else {
      snackbar.showSuccess("Vendor approved.");
      setOpen(false);
    }
  };

  return (
    <>
      {open && (
        <ConfirmModal
          title={`Would you like to approve vendor ${props.vendorName} for customer ${customerName}?`}
          errorMessage={errMsg}
          handleConfirm={handleClickSubmit}
          handleClose={() => setOpen(false)}
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
        Approve vendor
      </Button>
    </>
  );
}

export default ApproveVendor;
