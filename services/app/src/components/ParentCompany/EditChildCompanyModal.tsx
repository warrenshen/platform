import {
  Box,
  DialogActions,
  DialogContent,
  FormControl,
  TextField,
} from "@material-ui/core";
import PrimaryButton from "components/Shared/Button/PrimaryButton";
import SecondaryButton from "components/Shared/Button/SecondaryButton";
import USStateDropdown from "components/Shared/FormInputs/USStateDropdown";
import ModalDialog from "components/Shared/Modal/ModalDialog";
import Text, { TextVariants } from "components/Shared/Text/Text";
import { CompaniesInsertInput } from "generated/graphql";
import useSnackbar from "hooks/useSnackbar";
import { editChildCompany } from "lib/api/companies";
import { useState } from "react";
import SelectTimezoneMaterialUi from "select-timezone-material-ui";

interface Props {
  companyId: string;
  name: string;
  identifier: string;
  dbaName: string;
  state: string;
  employerIdentificationNumber: string;
  address: string;
  phoneNumber: string;
  timezone: string;
  handleClose: () => void;
}

export default function EditChildCompanyModal({
  companyId,
  name,
  identifier,
  dbaName,
  state,
  employerIdentificationNumber,
  address,
  phoneNumber,
  timezone,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();

  const [company, setCompany] = useState<CompaniesInsertInput>({
    id: companyId,
    name: name,
    identifier: identifier,
    dba_name: dbaName,
    state: state,
    employer_identification_number: employerIdentificationNumber,
    address: address,
    phone_number: phoneNumber,
    timezone: timezone,
    //   email: null,
  });

  const handleClickCreate = async () => {
    const response = await editChildCompany({
      company: company,
    });

    if (response.status !== "OK") {
      snackbar.showError(`Could not edit company! Error: ${response.msg}`);
    } else {
      snackbar.showSuccess("Company updated.");
      handleClose();
    }
  };

  const isSubmitDisabled = !company.name || !company.identifier;

  return (
    <ModalDialog handleClose={handleClose} title={"Edit Company Details"}>
      <DialogContent>
        <Box mt={-1}>
          <Text textVariant={TextVariants.Paragraph}>
            Please provide details about company.
          </Text>
        </Box>
        <Box>
          <TextField
            fullWidth
            data-cy={"company-form-input-name"}
            autoFocus
            label="Company Name"
            placeholder="Distributor Example"
            value={(company.name === "-" ? "" : company.name) || ""}
            onChange={({ target: { value } }) =>
              setCompany({ ...company, name: value })
            }
          />
        </Box>
        <Box mt={2}>
          <TextField
            fullWidth
            data-cy={"company-form-input-identifier"}
            label="Company Identifier (Unique Short Name)"
            placeholder="DE"
            value={(company.identifier === "-" ? "" : company.identifier) || ""}
            onChange={({ target: { value } }) =>
              setCompany({ ...company, identifier: value })
            }
          />
        </Box>
        <Box mt={2}>
          <TextField
            fullWidth
            data-cy={"company-form-input-dba"}
            label="DBA"
            placeholder="DBA 1, DBA 2"
            value={(company.dba_name === "-" ? "" : company.dba_name) || ""}
            onChange={({ target: { value } }) =>
              setCompany({ ...company, dba_name: value })
            }
          />
        </Box>
        <Box mt={3}>
          <Text textVariant={TextVariants.Paragraph} bottomMargin={8}>
            Location
          </Text>
        </Box>
        <Box>
          <SelectTimezoneMaterialUi
            data-cy={"edit-company-modal-timezone"}
            showTimezoneOffset
            label="Timezone"
            helperText="Please select a timezone from the list.
              Used to determine submission cut-off times for financing requests"
            timezoneName={company.timezone || undefined}
            onChange={(timezone) =>
              setCompany({ ...company, timezone: timezone })
            }
          />
        </Box>
        <Box mt={2}>
          <FormControl fullWidth>
            <USStateDropdown
              dataCy={"us-state-dropdown"}
              helperText={"Please select a US state from the list"}
              value={(company.state === "-" ? "" : company.state) || null}
              setValue={(state) => setCompany({ ...company, state: state })}
            />
          </FormControl>
        </Box>
        <Box mt={2}>
          <TextField
            fullWidth
            data-cy={"company-form-input-ein"}
            label="EIN"
            value={
              (company.employer_identification_number === "-"
                ? ""
                : company.employer_identification_number) || ""
            }
            onChange={({ target: { value } }) =>
              setCompany({ ...company, employer_identification_number: value })
            }
          />
        </Box>
        <Box mt={2}>
          <TextField
            fullWidth
            data-cy={"company-form-input-address"}
            label="Address"
            value={(company.address === "-" ? "" : company.address) || ""}
            onChange={({ target: { value } }) =>
              setCompany({ ...company, address: value })
            }
          />
        </Box>
        <Box mt={2}>
          <TextField
            fullWidth
            data-cy={"company-form-input-phone-number"}
            label="Phone Number"
            value={
              (company.phone_number === "-" ? "" : company.phone_number) || ""
            }
            onChange={({ target: { value } }) =>
              setCompany({ ...company, phone_number: value })
            }
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Box display="flex" mr={2} mt={2} mb={2}>
          <Box display="flex">
            <SecondaryButton text={"Cancel"} onClick={handleClose} />
          </Box>
          <PrimaryButton
            dataCy="edit-child-company-modal-submit"
            isDisabled={isSubmitDisabled}
            text={"Update"}
            onClick={handleClickCreate}
          />
        </Box>
      </DialogActions>
    </ModalDialog>
  );
}
