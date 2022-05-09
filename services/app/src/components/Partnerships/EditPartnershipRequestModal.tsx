import {
  Box,
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  makeStyles,
  Checkbox,
  FormControlLabel,
  TextField,
  Theme,
  Typography,
} from "@material-ui/core";
import useSnackbar from "hooks/useSnackbar";
import FileUploader from "components/Shared/File/FileUploader";
import PhoneInput from "components/Shared/FormInputs/PhoneInput";
import { updatePartnershipRequestNewMutation } from "lib/api/companies";
import { CreateVendorInput } from "pages/Anonymous/VendorForm";
import { isEmailValid } from "lib/validation";
import { FileFragment } from "generated/graphql";
import { FileTypeEnum } from "lib/enum";
import { useState, useMemo, ChangeEvent } from "react";

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

  const [vendorInput, setVendorInput] = useState<CreateVendorInput>({
    name: partnerRequest.company_name,
    dba: partnerRequest.request_info?.dba_name,
    contactFirstName: partnerRequest.user_info?.first_name,
    contactLastName: partnerRequest.user_info?.last_name,
    contactPhone: partnerRequest.user_info?.phone_number,
    contactEmail: partnerRequest.user_info?.email,
    bankName: partnerRequest.request_info?.bank_name,
    bankAccountName: partnerRequest.request_info?.bank_account_name,
    bankAccountNumber: partnerRequest.request_info?.bank_account_number,
    bankACHRoutingNumber: partnerRequest.request_info?.bank_ach_routing_number,
    bankWireRoutingNumber:
      partnerRequest.request_info?.bank_wire_routing_number,
    beneficiaryAddress: partnerRequest.request_info?.beneficiary_address,
    bankInstructionsAttachmentId:
      partnerRequest.request_info?.bank_instructions_attachment_id,
    isCannabis: partnerRequest.is_cannabis,
    cannabisLicenseNumber: partnerRequest.license_info
      ? { license_ids: partnerRequest.license_info.license_ids }
      : { license_ids: [] },
    cannabisLicenseCopyAttachmentId: partnerRequest.license_info
      ? partnerRequest.license_info.license_file_id
      : "",
  });

  const bankInstructionsAttachmentIds = useMemo(
    () =>
      vendorInput.bankInstructionsAttachmentId
        ? [vendorInput.bankInstructionsAttachmentId]
        : undefined,
    [vendorInput.bankInstructionsAttachmentId]
  );

  const cannabisLicenseCopyAttachmentIds = useMemo(
    () =>
      vendorInput.cannabisLicenseCopyAttachmentId
        ? [vendorInput.cannabisLicenseCopyAttachmentId]
        : undefined,
    [vendorInput.cannabisLicenseCopyAttachmentId]
  );

  const isSubmitDisabled = false;

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
          bank_account_number: vendorInput.bankAccountNumber,
          bank_ach_routing_number: vendorInput.bankACHRoutingNumber,
          bank_wire_routing_number: vendorInput.bankWireRoutingNumber,
          beneficiary_address: vendorInput.beneficiaryAddress,
          bank_instructions_attachment_id:
            vendorInput.bankInstructionsAttachmentId,
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
        <Box display="flex" flexDirection="column">
          <Box display="flex" flexDirection="column">
            <Box mt={2}>
              <Typography variant="body1">
                {`Customer: ${partnerRequest.requesting_company.name}`}
              </Typography>
            </Box>
          </Box>

          <Box display="flex" flexDirection="column" mt={4}>
            <TextField
              label="Vendor Name"
              required
              value={vendorInput.name}
              onChange={({ target: { value } }) => {
                setVendorInput({ ...vendorInput, name: value });
              }}
            />
          </Box>
          <Box display="flex" flexDirection="column" mt={4}>
            <TextField
              label="DBA"
              value={vendorInput.dba}
              onChange={({ target: { value } }) => {
                setVendorInput({ ...vendorInput, dba: value });
              }}
            />
          </Box>

          <Box display="flex" flexDirection="column" mt={6}>
            <Typography variant="h6" color="textSecondary">
              Vendor Verification Contact Information
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column">
            <TextField
              label="Contact First Name"
              required
              value={vendorInput.contactFirstName}
              onChange={({ target: { value } }) => {
                setVendorInput({ ...vendorInput, contactFirstName: value });
              }}
            />
          </Box>
          <Box display="flex" flexDirection="column" mt={4}>
            <TextField
              label="Contact Last Name"
              required
              value={vendorInput.contactLastName}
              onChange={({ target: { value } }) => {
                setVendorInput({ ...vendorInput, contactLastName: value });
              }}
            />
          </Box>
          <Box display="flex" flexDirection="column" mt={4}>
            <PhoneInput
              label="Contact Phone"
              isRequired
              value={vendorInput.contactPhone || null}
              handleChange={(value) =>
                setVendorInput({
                  ...vendorInput,
                  contactPhone: value,
                })
              }
            />
          </Box>
          <Box display="flex" flexDirection="column" mt={4}>
            <TextField
              label="Contact Email"
              required
              value={vendorInput.contactEmail}
              error={
                !!vendorInput.contactEmail &&
                !isEmailValid(vendorInput.contactEmail)
              }
              onChange={({ target: { value } }) => {
                setVendorInput({ ...vendorInput, contactEmail: value });
              }}
            />
          </Box>

          <Box display="flex" flexDirection="column" mt={6}>
            <Typography variant="h6" color="textSecondary">
              Vendor Bank Information
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column">
            <TextField
              label="Bank Name"
              required
              value={vendorInput.bankName}
              onChange={({ target: { value } }) => {
                setVendorInput({ ...vendorInput, bankName: value });
              }}
            />
          </Box>
          <Box display="flex" flexDirection="column" mt={4}>
            <TextField
              label="Bank Account Name"
              required
              value={vendorInput.bankAccountName}
              onChange={({ target: { value } }) => {
                setVendorInput({ ...vendorInput, bankAccountName: value });
              }}
            />
          </Box>
          <Box display="flex" flexDirection="column" mt={4}>
            <TextField
              label="Bank Account Number"
              required
              value={vendorInput.bankAccountNumber}
              onChange={({ target: { value } }) => {
                setVendorInput({ ...vendorInput, bankAccountNumber: value });
              }}
            />
          </Box>
          <Box display="flex" flexDirection="column" mt={4}>
            <TextField
              label="Bank ACH Routing Number"
              value={vendorInput.bankACHRoutingNumber}
              onChange={({ target: { value } }) => {
                setVendorInput({ ...vendorInput, bankACHRoutingNumber: value });
              }}
            />
          </Box>
          <Box display="flex" flexDirection="column" mt={4}>
            <TextField
              label="Bank Wire Routing Number"
              value={vendorInput.bankWireRoutingNumber}
              onChange={({ target: { value } }) => {
                setVendorInput({
                  ...vendorInput,
                  bankWireRoutingNumber: value,
                });
              }}
            />
          </Box>
          <Box display="flex" flexDirection="column" mt={4}>
            <TextField
              label="Beneficiary Address"
              required
              value={vendorInput.beneficiaryAddress}
              onChange={({ target: { value } }) => {
                setVendorInput({ ...vendorInput, beneficiaryAddress: value });
              }}
            />
          </Box>
          <Box display="flex" flexDirection="column" mt={4}>
            <Box mb={1}>
              <Typography variant="subtitle1" color="textSecondary">
                Bank Instructions or Canceled Check File Attachment
              </Typography>
            </Box>
            <FileUploader
              isCountVisible={false}
              companyId={partnerRequest.requesting_company.id}
              fileType={FileTypeEnum.BANK_INSTRUCTIONS}
              maxFilesAllowed={1}
              fileIds={bankInstructionsAttachmentIds}
              frozenFileIds={[]}
              handleDeleteFileById={() =>
                setVendorInput({
                  ...vendorInput,
                  bankInstructionsAttachmentId: "null",
                })
              }
              handleNewFiles={(files: FileFragment[]) =>
                setVendorInput({
                  ...vendorInput,
                  bankInstructionsAttachmentId: files[0].id,
                })
              }
            />
          </Box>

          <Box display="flex" flexDirection="column" mt={6}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!vendorInput.isCannabis}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setVendorInput({
                      ...vendorInput,
                      isCannabis: event.target.checked,
                    })
                  }
                  color="primary"
                />
              }
              label={"Is this vendor a cannabis company?"}
            />
          </Box>
          {vendorInput.isCannabis && (
            <>
              <Box display="flex" flexDirection="column" mt={2}>
                <TextField
                  label="Cannabis License Number"
                  required
                  value={vendorInput.cannabisLicenseNumber.license_ids.join(
                    ","
                  )}
                  onChange={({ target: { value } }) => {
                    let licenseIds = value.split(",").map((l) => {
                      return l.trim();
                    });
                    setVendorInput({
                      ...vendorInput,
                      cannabisLicenseNumber: { license_ids: licenseIds },
                    });
                  }}
                />
                <Typography variant="body1" color="textSecondary">
                  Type N/A to indicate not applicable if your company is not a
                  cannabis license holder.
                </Typography>
              </Box>
              <Box display="flex" flexDirection="column" mt={4}>
                <Box mb={1}>
                  <Typography variant="subtitle1" color="textSecondary">
                    Cannabis License Copy File Attachment
                  </Typography>
                </Box>
                <FileUploader
                  isCountVisible={false}
                  companyId={partnerRequest.requesting_company.id}
                  fileType={FileTypeEnum.COMPANY_LICENSE}
                  maxFilesAllowed={1}
                  fileIds={cannabisLicenseCopyAttachmentIds}
                  frozenFileIds={[]}
                  handleDeleteFileById={() =>
                    setVendorInput({
                      ...vendorInput,
                      cannabisLicenseCopyAttachmentId: "null",
                    })
                  }
                  handleNewFiles={(files: FileFragment[]) =>
                    setVendorInput({
                      ...vendorInput,
                      cannabisLicenseCopyAttachmentId: files[0].id,
                    })
                  }
                />
              </Box>
            </>
          )}
        </Box>
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
