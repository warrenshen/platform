import {
  Box,
  TextField,
  Typography,
  Button,
  Checkbox,
  FormControlLabel,
  createStyles,
  makeStyles,
  Theme,
} from "@material-ui/core";
import FileUploader from "components/Shared/File/FileUploader";
import PhoneInput from "components/Shared/FormInputs/PhoneInput";
import BankAccountTypeDropdown from "components/BankAccount/BankAccountTypeDropdown";
import { FileFragment } from "generated/graphql";
import { FileTypeEnum } from "lib/enum";
import { CreateVendorInput } from "pages/Anonymous/VendorForm";
import { useMemo, ChangeEvent } from "react";
import { BankAccountType } from "lib/enum";

import { isEmailValid } from "lib/validation";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    actionButtonWrapper: {
      display: "flex",
      justifyContent: "center",
    },
    actionButton: {
      width: 300,
    },
  })
);

interface Props {
  isLoading: boolean;
  companyId: string;
  companyName: string;
  vendorInput: CreateVendorInput;
  setVendorInput: (vendorInput: CreateVendorInput) => void;
  errorMessage: string;
  handleSubmit: () => void;
}

export default function CreateVendorPartnershipRequestForm({
  isLoading,
  companyId,
  companyName,
  vendorInput,
  setVendorInput,
  errorMessage,
  handleSubmit,
}: Props) {
  const classes = useStyles();

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

  const isSubmitDisabled =
    isLoading ||
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

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" flexDirection="column">
        <TextField label="Company Name" disabled value={companyName} />
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
        <BankAccountTypeDropdown
          bankAccountType={vendorInput.bankAccountType as BankAccountType}
          setBankAccountType={(value) =>
            setVendorInput({
              ...vendorInput,
              bankAccountType: value as BankAccountType,
            })
          }
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
            setVendorInput({ ...vendorInput, bankWireRoutingNumber: value });
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
          companyId={companyId}
          fileType={FileTypeEnum.BANK_INSTRUCTIONS}
          maxFilesAllowed={1}
          fileIds={bankInstructionsAttachmentIds}
          frozenFileIds={[]}
          isAnonymousUser={true}
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
              value={vendorInput.cannabisLicenseNumber.license_ids.join(",")}
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
              companyId={companyId}
              fileType={FileTypeEnum.COMPANY_LICENSE}
              maxFilesAllowed={1}
              fileIds={cannabisLicenseCopyAttachmentIds}
              frozenFileIds={[]}
              isAnonymousUser={true}
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
      <Box display="flex" flexDirection="column" mt={4}>
        <Typography variant="body1" color="textSecondary">
          Note : Bespoke Financial will process a $0.01 test ACH to the provided
          bank account. Please expect to verbally verify over the phone.
        </Typography>
      </Box>

      <Box className={classes.actionButtonWrapper} mt={4}>
        <Button
          className={classes.actionButton}
          disabled={isSubmitDisabled}
          variant="contained"
          color="primary"
          onClick={handleSubmit}
        >
          Submit
        </Button>

        {errorMessage && (
          <Typography variant="body2" color="secondary">
            {errorMessage}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
