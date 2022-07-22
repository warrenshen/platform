import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Theme,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import CreateUpdateVendorPartnershipRequestForm from "components/Vendors/CreateUpdateVendorPartnershipRequestForm";
import { useGetAllArtifactRelationsQuery } from "generated/graphql";
import useSnackbar from "hooks/useSnackbar";
import { updatePartnershipRequestNewMutation } from "lib/api/companies";
import { PartnershipRequestType } from "lib/enum";
import { isEmailValid } from "lib/validation";
import { CreateVendorInput } from "pages/Anonymous/VendorForm";
import { useState } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialog: {
      minWidth: "500px",
    },
    dialogTitle: {
      borderBottom: "1px solid #c7c7c7",
    },
    dialogActions: {
      margin: theme.spacing(2),
    },
    submitButton: {
      marginLeft: theme.spacing(1),
    },
  })
);

interface Props {
  partnerRequest: any;
  handleClose: () => void;
}

export default function EditPartnershipRequestModal({
  partnerRequest,
  handleClose,
}: Props) {
  const classes = useStyles();
  const snackbar = useSnackbar();

  const { data } = useGetAllArtifactRelationsQuery({
    fetchPolicy: "network-only",
  });

  const vendors = data?.vendors || [];

  const [vendorInput, setVendorInput] = useState<CreateVendorInput>({
    name: partnerRequest?.company_name || "",
    dba: partnerRequest?.request_info?.dba_name || "",
    contactFirstName: partnerRequest?.user_info?.first_name || "",
    contactLastName: partnerRequest?.user_info?.last_name || "",
    contactPhone: partnerRequest?.user_info?.phone_number || "",
    contactEmail: partnerRequest?.user_info?.email || "",
    bankName: partnerRequest?.request_info?.bank_name || "",
    bankAccountName: partnerRequest?.request_info?.bank_account_name || "",
    bankAccountType: partnerRequest?.request_info?.bank_account_type || "",
    bankAccountNumber: partnerRequest?.request_info?.bank_account_number || "",
    bankACHRoutingNumber:
      partnerRequest?.request_info?.bank_ach_routing_number || "",
    bankWireRoutingNumber:
      partnerRequest?.request_info?.bank_wire_routing_number || "",
    beneficiaryAddress: partnerRequest?.request_info?.beneficiary_address || "",
    bankInstructionsAttachmentId:
      partnerRequest?.request_info?.bank_instructions_attachment_id || "",
    isCannabis: partnerRequest?.is_cannabis || false,
    cannabisLicenseNumber: !!partnerRequest?.license_info?.license_ids
      ? { license_ids: partnerRequest.license_info.license_ids }
      : { license_ids: [] },
    cannabisLicenseCopyAttachmentId: !!partnerRequest?.license_info
      ?.license_file_id
      ? partnerRequest.license_info.license_file_id
      : "",
  });

  const isSubmitDisabled =
    !vendorInput.name ||
    !vendorInput.contactFirstName ||
    !vendorInput.contactLastName ||
    !vendorInput.contactPhone ||
    !vendorInput.contactEmail ||
    !isEmailValid(vendorInput.contactEmail) ||
    !vendorInput.bankName ||
    !vendorInput.bankAccountName ||
    !vendorInput.bankAccountType ||
    !vendorInput.bankAccountNumber ||
    // Only the ACH or Wire routing number is required
    (!vendorInput.bankACHRoutingNumber && !vendorInput.bankWireRoutingNumber) ||
    !vendorInput.beneficiaryAddress ||
    !vendorInput.bankInstructionsAttachmentId ||
    (vendorInput.isCannabis &&
      !vendorInput.cannabisLicenseNumber.license_ids.length) ||
    // cannabisLicenseCopyAttachment is required only if the cannabisLicenseNumber exists
    (vendorInput.isCannabis &&
      vendorInput.cannabisLicenseNumber.license_ids[0] !== "N/A" &&
      !vendorInput.cannabisLicenseCopyAttachmentId);

  const handleSubmit = async () => {
    const response = await updatePartnershipRequestNewMutation({
      variables: {
        partnership_request_id: partnerRequest.id,
        company: {
          name: vendorInput.name,
          is_cannabis: vendorInput.isCannabis,
        },
        user: {
          first_name: vendorInput.contactFirstName,
          last_name: vendorInput.contactLastName,
          email: vendorInput.contactEmail,
          phone_number: vendorInput.contactPhone,
        },
        license_info: {
          license_ids: vendorInput.cannabisLicenseNumber.license_ids,
          license_file_id: vendorInput.cannabisLicenseCopyAttachmentId,
        },
        request_info: {
          dba_name: vendorInput.dba,
          bank_name: vendorInput.bankName,
          bank_account_name: vendorInput.bankAccountName,
          bank_account_type: vendorInput.bankAccountType,
          bank_account_number: vendorInput.bankAccountNumber,
          bank_ach_routing_number: vendorInput.bankACHRoutingNumber,
          bank_wire_routing_number: vendorInput.bankWireRoutingNumber,
          beneficiary_address: vendorInput.beneficiaryAddress,
          bank_instructions_attachment_id:
            vendorInput.bankInstructionsAttachmentId,
          type: partnerRequest?.request_info.type,
        },
      },
    });

    if (response.status !== "OK") {
      snackbar.showError(
        `Error! Could not update partnership request. Reason: ${response.msg}`
      );
    } else {
      snackbar.showSuccess("Partnership updated");
      handleClose();
    }
  };

  return (
    <Dialog
      open
      onClose={handleClose}
      maxWidth="xl"
      classes={{ paper: classes.dialog }}
    >
      <DialogTitle className={classes.dialogTitle}>
        Edit Partnership Request
      </DialogTitle>
      <DialogContent>
        <CreateUpdateVendorPartnershipRequestForm
          companyId={partnerRequest.requesting_company.id}
          companyName={partnerRequest.requesting_company.name}
          vendorInput={vendorInput}
          setVendorInput={setVendorInput}
          isUpdate={true}
          selectableVendors={vendors}
          isMoved={
            partnerRequest.request_info?.type ===
            PartnershipRequestType.MoveToAction
          }
        />
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Box>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            className={classes.submitButton}
            disabled={isSubmitDisabled}
            onClick={handleSubmit}
            variant="contained"
            color="primary"
          >
            Save
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
