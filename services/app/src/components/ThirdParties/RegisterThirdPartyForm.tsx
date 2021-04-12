import {
  Box,
  DialogContent,
  DialogContentText,
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
import { CompanyTypeToDisplayLower, CompanyTypeToDisplayUpper } from "lib/enum";

interface Props {
  companyType: CompanyTypeEnum;
  role: UserRolesEnum;
  contact: UsersInsertInput;
  setContact: (contact: UsersInsertInput) => void;
  company: CompaniesInsertInput;
  setCompany: (company: CompaniesInsertInput) => void;
  errorMessage: string | null;
}

export default function RegisterThirdPartyForm({
  companyType,
  role,
  contact,
  setContact,
  company,
  setCompany,
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
            label={`${companyTypeUpper} Name`}
            required
            value={company.name}
            onChange={({ target: { value } }) => {
              setCompany({ ...company, name: value });
            }}
          />
        </Box>
        <Box display="flex" flexDirection="column" my={3}>
          <Typography variant="subtitle1">
            {companyTypeUpper}'s Primary Contact
          </Typography>
          <Box display="flex" flexDirection="column" mx={2}>
            <TextField
              required
              label="First Name"
              value={contact.first_name}
              onChange={({ target: { value } }) => {
                setContact({ ...contact, first_name: value });
              }}
            />
            <TextField
              required
              label="Last Name"
              value={contact.last_name}
              onChange={({ target: { value } }) => {
                setContact({ ...contact, last_name: value });
              }}
            />
            <TextField
              required
              label="Email"
              value={contact.email}
              onChange={({ target: { value } }) => {
                setContact({ ...contact, email: value });
              }}
            />
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
      {errorMessage && (
        <Typography variant="body2" color="secondary">
          {errorMessage}
        </Typography>
      )}
    </DialogContent>
  );
}
