import {
  Box,
  Checkbox,
  DialogContent,
  DialogContentText,
  FormControlLabel,
  TextField,
  Typography,
} from "@material-ui/core";
import PhoneInput from "components/Shared/FormInputs/PhoneInput";
import {
  CompaniesInsertInput,
  CompanyTypeEnum,
  UserRolesEnum,
  UsersInsertInput,
} from "generated/graphql";
import { LicenseInfo } from "lib/api/companies";
import { CompanyTypeToDisplayLower, CompanyTypeToDisplayUpper } from "lib/enum";
import { ChangeEvent } from "react";

interface Props {
  companyType: CompanyTypeEnum;
  role: UserRolesEnum;
  contact: UsersInsertInput;
  setContact: (contact: UsersInsertInput) => void;
  company: CompaniesInsertInput;
  setCompany: (company: CompaniesInsertInput) => void;
  licenseInfo: LicenseInfo;
  setLicenseInfo: (info: LicenseInfo) => void;
  errorMessage: string | null;
}

export default function RegisterThirdPartyForm({
  companyType,
  role,
  contact,
  setContact,
  company,
  setCompany,
  licenseInfo,
  setLicenseInfo,
  errorMessage,
}: Props) {
  // In practice, these should never be "Unknown"
  const companyTypeLower = CompanyTypeToDisplayLower[companyType];
  const companyTypeUpper = CompanyTypeToDisplayUpper[companyType];

  return (
    <DialogContent>
      <DialogContentText>
        {role !== UserRolesEnum.BankAdmin
          ? `Please provide details about the ${companyTypeLower} you are working with. After you register this ${companyTypeLower}, Bespoke will email the ${companyTypeLower} a ${companyTypeUpper} Agreement via DocuSign. Once the ${companyTypeLower} signs the agreement, Bespoke will verify the ${companyTypeLower}'s information and licenses.`
          : `Please provide details about the ${companyTypeLower} you want to create.`}
      </DialogContentText>
      <Box my={2}>
        <Box display="flex" flexDirection="column">
          <TextField
            autoFocus
            label={`${companyTypeUpper} Name`}
            required
            value={company.name}
            onChange={({ target: { value } }) => {
              setCompany({ ...company, name: value });
            }}
          />
        </Box>
        <Box display="flex" flexDirection="column" mt={4}>
          <FormControlLabel
            control={
              <Checkbox
                checked={!!company.is_cannabis}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setCompany({
                    ...company,
                    is_cannabis: event.target.checked,
                  })
                }
                color="primary"
              />
            }
            label={"Is this company a cannabis company?"}
          />
        </Box>
        {company.is_cannabis && (
          <Box display="flex" flexDirection="column" mt={4}>
            <TextField
              required
              label="License IDs (comma separated if multiple licenses)"
              value={licenseInfo.license_ids.join(",")}
              onChange={({ target: { value } }) => {
                let licenseIds = value.split(",").map((l) => {
                  return l.trim();
                });
                setLicenseInfo({ ...licenseInfo, license_ids: licenseIds });
              }}
            />
          </Box>
        )}
        <Box display="flex" flexDirection="column" mt={4}>
          <Typography variant="subtitle1">
            {companyTypeUpper}'s Primary Contact
          </Typography>
          <Box display="flex" flexDirection="column" mx={2}>
            <Box display="flex" flexDirection="column" mt={4}>
              <TextField
                required
                label="First Name"
                value={contact.first_name}
                onChange={({ target: { value } }) =>
                  setContact({ ...contact, first_name: value })
                }
              />
            </Box>
            <Box display="flex" flexDirection="column" mt={4}>
              <TextField
                required
                label="Last Name"
                value={contact.last_name}
                onChange={({ target: { value } }) =>
                  setContact({ ...contact, last_name: value })
                }
              />
            </Box>
            <Box display="flex" flexDirection="column" mt={4}>
              <TextField
                required
                label="Email"
                value={contact.email}
                onChange={({ target: { value } }) =>
                  setContact({ ...contact, email: value })
                }
              />
            </Box>
            <Box display="flex" flexDirection="column" mt={4}>
              <PhoneInput
                isRequired
                value={contact.phone_number || null}
                handleChange={(value) =>
                  setContact({ ...contact, phone_number: value })
                }
              />
            </Box>
          </Box>
        </Box>
      </Box>
      {errorMessage && (
        <Typography variant="body2" color="secondary">
          {errorMessage}
        </Typography>
      )}
    </DialogContent>
  );
}
