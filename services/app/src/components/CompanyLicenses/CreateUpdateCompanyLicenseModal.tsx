import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@material-ui/core";
import FileUploader from "components/Shared/File/FileUploader";
import Modal from "components/Shared/Modal/Modal";
import CompanyLicenseAutocomplete from "components/ThirdParties/CompanyLicenseAutocomplete";
import {
  Companies,
  CompanyLicenses,
  CompanyLicensesInsertInput,
  FileFragment,
  useGetCompanyLicenseQuery,
  useGetCompanyLicenseRelationsByCompanyIdQuery,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { createUpdateCompanyLicenseMutation } from "lib/api/licenses";
import { ActionType, FileTypeEnum } from "lib/enum";
import { isNull, mergeWith } from "lodash";
import { ChangeEvent, useMemo, useState } from "react";

interface Props {
  actionType: ActionType;
  companyId: Companies["id"];
  companyLicenseId: CompanyLicenses["id"] | null;
  handleClose: () => void;
}

export default function CreateUpdateCompanyLicenseModal({
  actionType,
  companyId,
  companyLicenseId,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();

  const isActionTypeUpdate = actionType === ActionType.Update;

  // Default CompanyLicense for CREATE case.
  const newCompanyLicense: CompanyLicensesInsertInput = {
    id: null,
    company_id: companyId,
    license_number: "",
    facility_row_id: null,
    is_underwriting_enabled: false,
  };

  const [companyLicense, setCompanyLicense] = useState(newCompanyLicense);

  const { loading: isGetCompanyLicenseLoading, error: getCompanyLicenseError } =
    useGetCompanyLicenseQuery({
      skip: actionType === ActionType.New,
      fetchPolicy: "network-only",
      variables: {
        id: companyLicenseId,
      },
      onCompleted: (data) => {
        const existingCompanyLicense = data?.company_licenses_by_pk;
        if (isActionTypeUpdate && existingCompanyLicense) {
          setCompanyLicense(
            mergeWith(newCompanyLicense, existingCompanyLicense, (a, b) =>
              isNull(b) ? a : b
            )
          );
        }
      },
    });

  if (getCompanyLicenseError) {
    alert(`Error in query: ${getCompanyLicenseError.message}`);
    console.error({ error: getCompanyLicenseError });
  }

  const {
    data: getCompanyLicenseRelationsData,
    loading: isGetCompanyLicenseRelationsLoading,
    error: getCompanyLicenseRelationsError,
  } = useGetCompanyLicenseRelationsByCompanyIdQuery({
    fetchPolicy: "network-only",
    variables: {
      company_id: companyId,
    },
  });

  if (getCompanyLicenseRelationsError) {
    alert(`Error in query: ${getCompanyLicenseRelationsError.message}`);
    console.error({ error: getCompanyLicenseRelationsError });
  }

  const company = getCompanyLicenseRelationsData?.companies_by_pk;
  const companyFacilities = company?.company_facilities || [];

  const [
    createUpdateCompanyLicense,
    { loading: isCreateUpdateCompanyLicense },
  ] = useCustomMutation(createUpdateCompanyLicenseMutation);

  const handleClickSubmit = async () => {
    const response = await createUpdateCompanyLicense({
      variables: {
        id: companyLicense.id,
        company_id: companyLicense.company_id,
        license_number: companyLicense.license_number,
        file_id: companyLicense.file_id,
        facility_row_id: companyLicense.facility_row_id,
        is_underwriting_enabled: companyLicense.is_underwriting_enabled,
      },
    });

    if (response.status !== "OK") {
      snackbar.showError(
        `Could not save company license. Error: ${response.msg}`
      );
    } else {
      snackbar.showSuccess(`Company license saved successfully.`);
      handleClose();
    }
  };

  const fileIds = useMemo(
    () => (companyLicense.file_id ? [companyLicense.file_id] : undefined),
    [companyLicense.file_id]
  );

  const isFormLoading =
    isGetCompanyLicenseLoading ||
    isGetCompanyLicenseRelationsLoading ||
    isCreateUpdateCompanyLicense;

  return (
    <Modal
      dataCy={"create-update-company-license-modal"}
      isPrimaryActionDisabled={isFormLoading}
      title={
        isActionTypeUpdate ? "Update Company License" : "Create Company License"
      }
      contentWidth={600}
      primaryActionText={"Save"}
      handleClose={handleClose}
      handlePrimaryAction={handleClickSubmit}
    >
      {!isActionTypeUpdate && !companyLicense.id && (
        <>
          <Box mt={2}>
            <Typography variant="body1">
              Two options to add a license to this company:
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="body2" color="textSecondary">
              Option 1: Search for an existing license in the license database.
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <CompanyLicenseAutocomplete
              handleSelectCompanyLicense={(selectedCompanyLicense) =>
                setCompanyLicense({
                  ...companyLicense,
                  id: selectedCompanyLicense.id,
                  license_number: selectedCompanyLicense.license_number,
                })
              }
            />
          </Box>
          <Box mt={2}>
            <Typography variant="body1" color="textSecondary">
              <strong>OR</strong>
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="body2" color="textSecondary">
              Option 2: Submit a new license that does not exist in the license
              database.
            </Typography>
          </Box>
        </>
      )}
      <Box display="flex" flexDirection="column" mt={2}>
        <TextField
          required
          data-cy="company-license-number-input"
          disabled={!!companyLicense.id}
          label={"License Number"}
          value={companyLicense.license_number}
          onChange={({ target: { value } }) =>
            setCompanyLicense({
              ...companyLicense,
              license_number: value,
            })
          }
        />
      </Box>
      <Box display="flex" flexDirection="column" mt={2}>
        <Typography variant="subtitle2" color="textSecondary">
          License File Attachment
        </Typography>
        <FileUploader
          isCountVisible={false}
          companyId={companyId}
          fileType={FileTypeEnum.VendorLicense}
          maxFilesAllowed={1}
          fileIds={fileIds}
          frozenFileIds={[]}
          handleDeleteFileById={() =>
            setCompanyLicense({
              ...companyLicense,
              file_id: null,
            })
          }
          handleNewFiles={(files: FileFragment[]) =>
            setCompanyLicense({
              ...companyLicense,
              file_id: files[0].id,
            })
          }
        />
      </Box>
      <Box display="flex" flexDirection="column" mt={2}>
        <FormControl>
          <InputLabel id="select-company-facility-label">
            Company Facility
          </InputLabel>
          <Select
            id="select-company-facility"
            labelId="select-company-facility-label"
            disabled={companyFacilities.length <= 0}
            value={
              (companyFacilities.length > 0 &&
                companyLicense.facility_row_id) ||
              ""
            }
            onChange={({ target: { value } }) =>
              setCompanyLicense({
                ...companyLicense,
                facility_row_id: value as CompanyLicenses["facility_row_id"],
              })
            }
          >
            {companyFacilities.map((companyFacility) => (
              <MenuItem key={companyFacility.id} value={companyFacility.id}>
                {companyFacility.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Box display="flex" flexDirection="column" mt={2}>
        <FormControlLabel
          control={
            <Checkbox
              data-cy="company-license-is-underwriting-enabled-checkbox"
              checked={!!companyLicense.is_underwriting_enabled}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setCompanyLicense({
                  ...companyLicense,
                  is_underwriting_enabled: event.target.checked,
                })
              }
              color="primary"
            />
          }
          label={"Is underwriting enabled?"}
        />
      </Box>
    </Modal>
  );
}
