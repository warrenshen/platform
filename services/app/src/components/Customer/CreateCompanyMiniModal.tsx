import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  FormControl,
  TextField,
} from "@material-ui/core";
import { SecondaryTextColor } from "components/Shared/Colors/GlobalColors";
import AutocompleteParentCompany from "components/Shared/Company/AutocompleteParentCompany";
import USStateDropdown from "components/Shared/FormInputs/USStateDropdown";
import ModalDialog from "components/Shared/Modal/ModalDialog";
import Text, { TextVariants } from "components/Shared/Text/Text";
import { CompaniesInsertInput } from "generated/graphql";
import useSnackbar from "hooks/useSnackbar";
import { createProspectiveCustomer } from "lib/api/companies";
import { useState } from "react";
import SelectTimezoneMaterialUi from "select-timezone-material-ui";

interface Props {
  handleClose: () => void;
}

export default function CreateCompanyMiniModal({ handleClose }: Props) {
  const snackbar = useSnackbar();

  const [company, setCompany] = useState<CompaniesInsertInput>({
    id: null,
    name: null,
    identifier: null,
    dba_name: null,
    parent_company_id: null,
    state: null,
    timezone: null,
  });

  const handleClickCreate = async () => {
    const response = await createProspectiveCustomer({
      company: company,
    });

    if (response.status !== "OK") {
      snackbar.showError(`Could not create company! Error: ${response.msg}`);
    } else {
      snackbar.showSuccess("Company created.");
      handleClose();
    }
  };

  const isSubmitDisabled =
    !company.name || !company.identifier || !company.state || !company.timezone;

  return (
    <ModalDialog handleClose={handleClose} title={"Create Company"}>
      <DialogContent>
        <Text textVariant={TextVariants.Paragraph}>
          What is the parent company?
        </Text>
        <Box mb={2}>
          <AutocompleteParentCompany
            textFieldLabel="Existing Parent Company"
            onChange={(selectedCompanyId) =>
              setCompany({ ...company, parent_company_id: selectedCompanyId })
            }
          />
        </Box>
        <Text textVariant={TextVariants.Paragraph} color={SecondaryTextColor}>
          If the company you want to create belongs to an existing parent
          company, please select that parent company above. Otherwise, leave the
          above blank.
        </Text>
        <Box>
          <Text textVariant={TextVariants.Paragraph}>Company Information</Text>
        </Box>
        <Box>
          <TextField
            fullWidth
            data-cy={"company-form-input-name"}
            autoFocus
            label="Company Name"
            placeholder="Distributor Example"
            value={company.name || ""}
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
            value={company.identifier || ""}
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
            value={company.dba_name || ""}
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
            showTimezoneOffset
            label="Timezone"
            helperText="Please select a timezone from the list"
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
              value={company.state || null}
              setValue={(state) => setCompany({ ...company, state: state })}
            />
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Box display="flex">
          <Box mr={1}>
            <Button onClick={handleClose}>Cancel</Button>
          </Box>
          <Button
            disabled={isSubmitDisabled}
            onClick={handleClickCreate}
            variant="contained"
            color="primary"
          >
            Submit
          </Button>
        </Box>
      </DialogActions>
    </ModalDialog>
  );
}
