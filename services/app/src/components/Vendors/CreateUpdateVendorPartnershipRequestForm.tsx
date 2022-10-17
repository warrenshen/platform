import { QueryLazyOptions } from "@apollo/client";
import {
  Box,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import BankAccountTypeDropdown from "components/BankAccount/BankAccountTypeDropdown";
import FileUploader from "components/Shared/File/FileUploader";
import PhoneInput from "components/Shared/FormInputs/PhoneInput";
import USStateDropdown from "components/Shared/FormInputs/USStateDropdown";
import AutocompleteVendors from "components/Vendors/AutocompleteVendors";
import {
  BankAccounts,
  Exact,
  FileFragment,
  GetAllArtifactRelationsQuery,
  GetCompanyLicensesForVendorOnboardingQuery,
  Users,
  Vendors,
} from "generated/graphql";
import { FileTypeEnum } from "lib/enum";
import { BankAccountType } from "lib/enum";
import { isEmailValid } from "lib/validation";
import { DebouncedFunc } from "lodash";
import { CreateVendorInput } from "pages/Anonymous/VendorForm";
import { ChangeEvent, useEffect, useMemo, useState } from "react";

import AutocompleteLicenseNumbers, {
  LicenseNumberOptionType,
} from "./AutocompleteLicenseNumbers";

interface Props {
  companyId: string;
  companyName: string;
  vendorInput: CreateVendorInput;
  setVendorInput: React.Dispatch<React.SetStateAction<CreateVendorInput>>;
  isUpdate: boolean;
  selectableVendors?: GetAllArtifactRelationsQuery["vendors"];
  selectableLicenseNumbers?: GetCompanyLicensesForVendorOnboardingQuery["company_licenses"];
  debouncedLoadCompanyLicenses: DebouncedFunc<
    (
      options?:
        | QueryLazyOptions<
            Exact<{
              license_number_search: string;
            }>
          >
        | undefined
    ) => void
  >;
  isMoved?: boolean;
}

export default function CreateUpdateVendorPartnershipRequestForm({
  companyId,
  companyName,
  vendorInput,
  setVendorInput,
  isUpdate,
  selectableVendors = [],
  selectableLicenseNumbers = [],
  debouncedLoadCompanyLicenses,
  isMoved = false,
}: Props) {
  const [selectedVendor, setSelectedVendor] = useState<Vendors | null>();
  const [selectedUser, setSelectedUser] = useState<Users | null>();
  const [selectedBankAccount, setSelectedBankAccount] =
    useState<BankAccounts | null>();

  const bankInstructionsAttachmentIds = useMemo(
    () =>
      vendorInput.bankInstructionsAttachmentId
        ? [vendorInput.bankInstructionsAttachmentId]
        : undefined,
    [vendorInput.bankInstructionsAttachmentId]
  );

  const users = selectedVendor?.users ? selectedVendor.users : [];
  const bankAccounts = selectedVendor?.bank_accounts
    ? selectedVendor.bank_accounts
    : [];

  // Update the input fields when the selected user changes
  useEffect(() => {
    if (!!selectedUser) {
      setVendorInput((prevVendorInput: CreateVendorInput) => {
        return {
          ...prevVendorInput,
          contactFirstName: selectedUser?.first_name || "",
          contactLastName: selectedUser?.last_name || "",
          contactPhone: selectedUser?.phone_number || "",
          contactEmail: selectedUser?.email || "",
          selected_user_id: selectedUser?.id,
        };
      });
    }
  }, [selectedUser, setVendorInput]);

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" flexDirection="column">
        <TextField label={"Your Customer"} disabled value={companyName} />
      </Box>
      {isMoved ? (
        <Box display="flex" flexDirection="column" mt={4}>
          <AutocompleteVendors
            dataCy={"vendor-form-autocomplete-vendors"}
            label={"Select Vendor"}
            selectableVendors={selectableVendors}
            selectedVendor={selectedVendor}
            onChange={(event, value) => {
              const vendorId = value?.id || null;
              const matchingVendor = selectableVendors.find(
                (vendor) => vendor.id === vendorId
              ) as Vendors;

              setSelectedVendor(matchingVendor);

              if (!!matchingVendor) {
                setVendorInput({
                  ...vendorInput,
                  name: matchingVendor?.name || "",
                  dba: matchingVendor?.dba_name || "",
                  contactFirstName: "",
                  contactLastName: "",
                  contactPhone: "",
                  contactEmail: "",
                  bankName: "",
                  bankAccountName: "",
                  bankAccountNumber: "",
                  bankAccountType: "",
                  bankACHRoutingNumber: "",
                  bankWireRoutingNumber: "",
                  beneficiaryAddress: "",
                  bankInstructionsAttachmentId: "",
                  isCannabis: false,
                  cannabisLicenseNumber: { license_ids: [] },
                });
              }
            }}
          />
        </Box>
      ) : null}

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
      <Box display="flex" flexDirection="column" mt={4}>
        <USStateDropdown
          isMetrcOnly
          value={vendorInput?.usState || ""}
          setValue={(value) =>
            setVendorInput({ ...vendorInput, usState: value })
          }
        />
      </Box>

      <Box display="flex" flexDirection="column" mt={6}>
        <Typography variant="h6" color="textSecondary">
          Vendor Verification Contact Information
        </Typography>
      </Box>
      {isMoved ? (
        <Box display="flex" flexDirection="column" mt={2}>
          <Autocomplete
            autoHighlight
            data-cy={"autocomplete-vendor-user"}
            id="autocomplete-vendor-user"
            value={typeof selectedUser === "undefined" ? null : selectedUser}
            options={users}
            getOptionLabel={(user) => {
              return `${user.first_name} ${user.last_name} | ${user.email} | ${user.phone_number}`;
            }}
            renderInput={(params) => {
              return (
                <TextField
                  {...params}
                  label={"Select Vendor User"}
                  variant="outlined"
                />
              );
            }}
            onChange={(event, value) => {
              const userId = value?.id || null;
              const matchingUser = users.find(
                (user) => user.id === userId
              ) as Users;

              setSelectedUser(matchingUser);
            }}
          />
        </Box>
      ) : null}

      <Box display="flex" flexDirection="column" mt={4}>
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
          value={vendorInput.contactPhone || ""}
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
      {isMoved ? (
        <Box display="flex" flexDirection="column" mt={2}>
          <Autocomplete
            autoHighlight
            data-cy={"autocomplete-bank-account"}
            id="autocomplete-bank-account"
            value={selectedBankAccount}
            options={bankAccounts}
            getOptionLabel={(bankAccount) => {
              return `${bankAccount.bank_name} | ${bankAccount.account_number}`;
            }}
            renderInput={(params) => {
              return (
                <TextField
                  {...params}
                  label={"Select Bank Account"}
                  variant="outlined"
                />
              );
            }}
            onChange={(event, value) => {
              const bankAccountId = value?.id || null;
              const matchingBankAccount = bankAccounts.find(
                (b) => b.id === bankAccountId
              ) as BankAccounts;

              setSelectedBankAccount(matchingBankAccount);

              setVendorInput((prevVendorInput: CreateVendorInput) => {
                return {
                  ...prevVendorInput,
                  bankName: matchingBankAccount?.bank_name || "",
                  bankAccountName: matchingBankAccount?.account_title || "",
                  bankAccountType:
                    (matchingBankAccount?.account_type as BankAccountType) ||
                    "",
                  bankAccountNumber: matchingBankAccount?.account_number || "",
                  bankWireRoutingNumber:
                    matchingBankAccount?.wire_routing_number || "",
                  bankACHRoutingNumber:
                    matchingBankAccount?.wire_routing_number || "",
                  selected_bank_account_id: matchingBankAccount?.id || "",
                };
              });
            }}
          />
        </Box>
      ) : null}

      <Box display="flex" flexDirection="column" mt={4}>
        <TextField
          label="Bank Name"
          required
          value={vendorInput?.bankName || ""}
          onChange={({ target: { value } }) => {
            setVendorInput({ ...vendorInput, bankName: value });
          }}
        />
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <TextField
          label="Bank Account Name"
          required
          value={vendorInput?.bankAccountName || ""}
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
          value={vendorInput?.bankAccountNumber || ""}
          onChange={({ target: { value } }) => {
            setVendorInput({ ...vendorInput, bankAccountNumber: value });
          }}
        />
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        {!isUpdate ? (
          <Typography variant="body2">
            {`Note: If your bank does not support ACH, please fill N/A for this field.`}
          </Typography>
        ) : null}
        <TextField
          label="Bank ACH Routing Number"
          required={!isUpdate}
          value={vendorInput?.bankACHRoutingNumber || ""}
          onChange={({ target: { value } }) => {
            setVendorInput({ ...vendorInput, bankACHRoutingNumber: value });
          }}
        />
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        {!isUpdate ? (
          <Typography variant="body2">
            {`Note: If your bank does not support Wire, please fill N/A for this field.`}
          </Typography>
        ) : null}
        <TextField
          label="Bank Wire Routing Number"
          required={!isUpdate}
          value={vendorInput?.bankWireRoutingNumber || ""}
          onChange={({ target: { value } }) => {
            setVendorInput({ ...vendorInput, bankWireRoutingNumber: value });
          }}
        />
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <TextField
          label="Beneficiary Address"
          required
          value={vendorInput?.beneficiaryAddress || ""}
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
          fileType={FileTypeEnum.BankInstructions}
          maxFilesAllowed={1}
          fileIds={bankInstructionsAttachmentIds}
          frozenFileIds={[]}
          isAnonymousUser={!isUpdate}
          handleDeleteFileById={() =>
            setVendorInput({
              ...vendorInput,
              bankInstructionsAttachmentId: "",
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
          label={
            <span>
              Do you sell cannabis or cannabis derivative products and have
              cannabis license(s)?
              <strong> If so, please provide all licenses.</strong>
            </span>
          }
        />
      </Box>
      {vendorInput.isCannabis && (
        <>
          <Box display="flex" flexDirection="column" mt={2}>
            <AutocompleteLicenseNumbers
              debouncedLoadCompanyLicenses={debouncedLoadCompanyLicenses}
              selectableLicenseNumbers={
                selectableLicenseNumbers as LicenseNumberOptionType[]
              }
              onChange={(_, value) => {
                const licenseNumbers = (value as LicenseNumberOptionType[]).map(
                  (license) => {
                    if (license.inputValue) {
                      return license.inputValue;
                    } else if (license.license_number) {
                      return license.license_number;
                    } else {
                      return license;
                    }
                  }
                );
                setVendorInput({
                  ...vendorInput,
                  cannabisLicenseNumber: {
                    license_ids: licenseNumbers as string[],
                  },
                });
              }}
            />
            <Typography variant="body1" color="textSecondary">
              Type N/A to indicate not applicable if your company is not a
              cannabis license holder.
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" mt={4}>
            <TextField
              autoFocus
              label="Metrc API Key"
              required
              value={vendorInput?.metrcApiKey || ""}
              onChange={({ target: { value } }) =>
                setVendorInput({ ...vendorInput, metrcApiKey: value })
              }
            />
            <Typography variant="body1" color="textSecondary">
              Bespoke Financial is a validated Metrc vendor with read-only
              access. We rely on Metrc data to validate cannabis and cannabis
              related transactions.
            </Typography>
          </Box>
        </>
      )}
      <Box display="flex" flexDirection="column" mt={4}>
        <Typography variant="body1" color="textSecondary">
          Note : Bespoke Financial will process a $0.01 test ACH to the provided
          bank account. Please expect to verbally verify over the phone.
        </Typography>
      </Box>
    </Box>
  );
}
