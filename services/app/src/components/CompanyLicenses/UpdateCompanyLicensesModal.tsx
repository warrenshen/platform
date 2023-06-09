import {
  Box,
  Button,
  Divider,
  FormControl,
  TextField,
  Typography,
} from "@material-ui/core";
import FileUploader from "components/Shared/File/FileUploader";
import USStateDropdown from "components/Shared/FormInputs/USStateDropdown";
import Modal from "components/Shared/Modal/Modal";
import CompanyLicenseAutocomplete from "components/ThirdParties/CompanyLicenseAutocomplete";
import {
  Companies,
  CompanyLicensesInsertInput,
  FileFragment,
  useGetVendorCompanyFileAttachmentsQuery,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { createUpdateLicensesMutation } from "lib/api/licenses";
import { FileTypeEnum } from "lib/enum";
import { logGraphQLQueryError } from "lib/logging";
import { useMemo, useState } from "react";

interface Props {
  companyId: Companies["id"];
  handleClose: () => void;
}

function CompanyLicenseForm({
  companyId,
  licenseIndex,
  companyLicense,
  error,
  setCompanyLicenses,
}: {
  companyId: Companies["id"];
  licenseIndex: number;
  companyLicense: CompanyLicensesInsertInput;
  error: boolean;
  setCompanyLicenses: React.Dispatch<
    React.SetStateAction<CompanyLicensesInsertInput[]>
  >;
}) {
  const fileIds = useMemo(
    () => (companyLicense.file_id ? [companyLicense.file_id] : undefined),
    [companyLicense.file_id]
  );

  const handleDeleteCompanyLicense = useMemo(
    () => () =>
      setCompanyLicenses((companyLicenses) => [
        ...companyLicenses.slice(0, licenseIndex),
        ...companyLicenses.slice(licenseIndex + 1),
      ]),
    [licenseIndex, setCompanyLicenses]
  );

  const handleDeleteFileByLicenseIndex = useMemo(
    () => () =>
      setCompanyLicenses((companyLicenses) => [
        ...companyLicenses.slice(0, licenseIndex),
        {
          ...companyLicenses[licenseIndex],
          file_id: null,
        },
        ...companyLicenses.slice(licenseIndex + 1),
      ]),
    [licenseIndex, setCompanyLicenses]
  );

  const handleNewFiles = useMemo(
    () => (files: FileFragment[]) =>
      setCompanyLicenses((companyLicenses) => [
        ...companyLicenses.slice(0, licenseIndex),
        {
          ...companyLicenses[licenseIndex],
          file_id: files[0].id,
        },
        ...companyLicenses.slice(licenseIndex + 1),
      ]),
    [licenseIndex, setCompanyLicenses]
  );

  return (
    <Box mt={4}>
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <TextField
          data-cy="license-number-input"
          required
          disabled={!!companyLicense.id}
          label={"License #"}
          value={companyLicense.license_number || ""}
          error={error}
          helperText={error && "License # already exists"}
          onChange={({ target: { value } }) =>
            setCompanyLicenses((companyLicenses) => [
              ...companyLicenses.slice(0, licenseIndex),
              {
                ...companyLicenses[licenseIndex],
                license_number: value.trim(),
              },
              ...companyLicenses.slice(licenseIndex + 1),
            ])
          }
        />
        {!companyLicense.id && (
          <Box>
            <Button
              disabled={!!companyLicense.id}
              variant={"outlined"}
              color={"default"}
              onClick={handleDeleteCompanyLicense}
            >
              x
            </Button>
          </Box>
        )}
      </Box>
      <Box mt={2}>
        <FormControl fullWidth>
          <USStateDropdown
            dataCy={"us-state-dropdown"}
            helperText={"Please select a US state from the list"}
            value={companyLicense.us_state || null}
            setValue={(state) =>
              setCompanyLicenses((companyLicenses) => [
                ...companyLicenses.slice(0, licenseIndex),
                {
                  ...companyLicenses[licenseIndex],
                  us_state: state,
                },
                ...companyLicenses.slice(licenseIndex + 1),
              ])
            }
          />
        </FormControl>
      </Box>
      <FileUploader
        isCountVisible={false}
        companyId={companyId}
        fileType={FileTypeEnum.VendorLicense}
        maxFilesAllowed={1}
        fileIds={fileIds}
        handleDeleteFileById={handleDeleteFileByLicenseIndex}
        handleNewFiles={handleNewFiles}
      />
      <Box mt={4}>
        <Divider />
      </Box>
    </Box>
  );
}

export default function UpdateCompanyLicensesModal({
  companyId,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();

  const [companyLicenses, setCompanyLicenses] = useState<
    CompanyLicensesInsertInput[]
  >([]);

  const [existingLicenseNumbers, setExistingLicenseNumbers] = useState(
    new Set()
  );

  const { loading: isCompanyLicensesLoading, error } =
    useGetVendorCompanyFileAttachmentsQuery({
      fetchPolicy: "network-only",
      variables: {
        company_id: companyId,
      },
      onCompleted: (data) => {
        const company = data?.companies_by_pk;
        if (company) {
          setCompanyLicenses(company.licenses);
        }
      },
    });

  if (error) {
    alert(`Error in query: ${error.message}`);
    console.error({ error });
    logGraphQLQueryError(error, "useGetVendorCompanyFileAttachmentsQuery", {
      company_id: companyId,
    });
  }

  const [createUpdateLicenses, { loading: isCreateUpdateLicensesLoading }] =
    useCustomMutation(createUpdateLicensesMutation);

  const handleClickSave = async () => {
    const response = await createUpdateLicenses({
      variables: {
        company_id: companyId,
        company_licenses: companyLicenses,
      },
    });

    if (response.status !== "OK") {
      snackbar.showError(`Could not update licenses. Error: ${response.msg}`);
      setExistingLicenseNumbers(new Set(response.data));
    } else {
      snackbar.showSuccess("Licenses updated.");
      handleClose();
    }
  };

  const isSubmitDisabled =
    isCompanyLicensesLoading || isCreateUpdateLicensesLoading;

  return (
    <Modal
      isPrimaryActionDisabled={isSubmitDisabled}
      title={"Update Licenses"}
      primaryActionText={"Save"}
      handleClose={handleClose}
      handlePrimaryAction={handleClickSave}
    >
      <Box display="flex" flexDirection="column">
        <Box display="flex" flexDirection="column">
          <Typography variant="h6">Licenses</Typography>
          <Typography variant="body2" color="textSecondary">
            Please reach out to the Bespoke Financial engineering team if you
            would like to DELETE an existing license.
          </Typography>
        </Box>
        <Box mt={2}>
          {companyLicenses.map((companyLicense, index) => (
            <CompanyLicenseForm
              key={index}
              companyId={companyId}
              licenseIndex={index}
              companyLicense={companyLicense}
              error={existingLicenseNumbers.has(companyLicense.license_number)}
              setCompanyLicenses={setCompanyLicenses}
            />
          ))}
        </Box>
        <Box mt={2}>
          <Typography variant="body1">
            Two options to add a license to this company:
          </Typography>
        </Box>
        {!isCompanyLicensesLoading && (
          <Box mt={2}>
            <Button
              data-cy="add-license-button"
              variant={"outlined"}
              color={"default"}
              onClick={() =>
                setCompanyLicenses([
                  ...companyLicenses,
                  {
                    id: null,
                    company_id: companyId,
                    file_id: null,
                    license_number: null,
                  },
                ])
              }
            >
              New License
            </Button>
          </Box>
        )}
        <Box mt={2}>
          <Typography variant="body1">OR</Typography>
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          <Box mb={1}>
            <Typography variant="body2" color="textSecondary">
              Search for an existing license in the system that is NOT assigned
              to a company yet.
            </Typography>
          </Box>
          <CompanyLicenseAutocomplete
            handleSelectCompanyLicense={(companyLicense) =>
              setCompanyLicenses([
                ...companyLicenses,
                {
                  id: companyLicense.id,
                  company_id: companyLicense.id,
                  file_id: companyLicense.file_id,
                  license_number: companyLicense.license_number,
                },
              ])
            }
          />
        </Box>
      </Box>
    </Modal>
  );
}
