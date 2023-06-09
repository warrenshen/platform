import { Box, Button } from "@material-ui/core";
import * as Sentry from "@sentry/react";
import ConfirmModal from "components/Shared/Confirmations/VendorConfirmModal";
import { useGetVendorPartnershipForBankQuery } from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { approvePartnershipMutation } from "lib/api/companies";
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

export default function ApproveVendor(props: Props) {
  const snackbar = useSnackbar();

  const [isNoEmailModalOpen, setIsNoEmailModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const [approvePartnership, { loading: isApprovePartnershipLoading }] =
    useCustomMutation(approvePartnershipMutation);

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
      window.console.error(msg);
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
    if (!vendor?.users || vendor.users.length <= 0) {
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
      setIsEmailModalOpen(false);
      setIsNoEmailModalOpen(false);
      return;
    }

    const response = await approvePartnership({
      variables: {
        partnership_id: vendorPartnershipId,
        is_payor: false,
      },
    });

    if (response.status !== "OK") {
      snackbar.showError(
        `Could not approve partnership. Error: ${response.msg}`
      );
      return;
    }

    refetch();

    if (isEmailModalOpen) {
      const resp = await props.notifier.sendVendorApproved({
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
        snackbar.showSuccess(
          "Vendor partnership approved and email notification sent to vendor."
        );
        setIsEmailModalOpen(false);
        setIsNoEmailModalOpen(false);
      }
    } else {
      snackbar.showSuccess("Vendor partnership approved.");
      setIsEmailModalOpen(false);
      setIsNoEmailModalOpen(false);
    }
  };

  return (
    <>
      {isEmailModalOpen && (
        <ConfirmModal
          isEmailWarningShown
          title={`Would you like to approve vendor ${props.vendorName} for customer ${customerName}?`}
          errorMessage={errMsg}
          handleConfirm={handleClickSubmit}
          handleClose={() => setIsEmailModalOpen(false)}
        />
      )}
      {isNoEmailModalOpen && (
        <ConfirmModal
          title={`Would you like to approve vendor ${props.vendorName} for customer ${customerName}?`}
          errorMessage={errMsg}
          handleConfirm={handleClickSubmit}
          handleClose={() => setIsNoEmailModalOpen(false)}
        />
      )}
      <Box mb={1}>
        <Button
          disabled={isApprovePartnershipLoading}
          size="small"
          variant="contained"
          color="primary"
          onClick={() => {
            setIsEmailModalOpen(true);
          }}
        >
          Approve Vendor Partnership With Email Notification To Vendor
        </Button>
      </Box>
      <Box>
        <Button
          disabled={isApprovePartnershipLoading}
          size="small"
          variant="contained"
          color="primary"
          onClick={() => {
            setIsNoEmailModalOpen(true);
          }}
        >
          Approve Vendor Partnership Without Email Notification
        </Button>
      </Box>
    </>
  );
}
