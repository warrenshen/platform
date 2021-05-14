import { Box, Button, Divider, TextField, Typography } from "@material-ui/core";
import FileUploader from "components/Shared/File/FileUploader";
import Modal from "components/Shared/Modal/Modal";
import {
  Companies,
  CompanyLicensesInsertInput,
  FileFragment,
  useGetVendorCompanyFileAttachmentsQuery,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { FileTypeEnum } from "lib/enum";
import { createUpdateLicensesMutation } from "lib/licenses";
import { useMemo, useState } from "react";

interface Props {
  companyId: Companies["id"];
  vendorPartnershipId: string;
  handleClose: () => void;
}

function CompanyLicenseForm({
  companyId,
  licenseIndex,
  companyLicense,
  setCompanyLicenses,
}: {
  companyId: Companies["id"];
  licenseIndex: number;
  companyLicense: CompanyLicensesInsertInput;
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
        mb={2}
      >
        <TextField
          required
          label={"License #"}
          value={companyLicense.license_number || ""}
          onChange={({ target: { value } }) =>
            setCompanyLicenses((companyLicenses) => [
              ...companyLicenses.slice(0, licenseIndex),
              {
                ...companyLicenses[licenseIndex],
                license_number: value,
              },
              ...companyLicenses.slice(licenseIndex + 1),
            ])
          }
        />
        <Box>
          <Button
            variant={"outlined"}
            color={"default"}
            onClick={handleDeleteCompanyLicense}
          >
            x
          </Button>
        </Box>
      </Box>
      <FileUploader
        isCountVisible={false}
        companyId={companyId}
        fileType={FileTypeEnum.VENDOR_LICENSE}
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
  vendorPartnershipId,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();

  const [companyLicenses, setCompanyLicenses] = useState<
    CompanyLicensesInsertInput[]
  >([]);

  const {
    data,
    loading: isVendorCompanyFileAttachmentsLoading,
    error,
  } = useGetVendorCompanyFileAttachmentsQuery({
    fetchPolicy: "network-only",
    variables: {
      company_id: companyId,
    },
    onCompleted: (data) => {
      const existingVendorCompany = data?.companies_by_pk;
      if (existingVendorCompany) {
        setCompanyLicenses(existingVendorCompany.licenses);
      }
    },
  });

  if (error) {
    alert(`Error in query: ${error.message}`);
    console.log({ error });
  }

  const vendor = data?.companies_by_pk || null;

  const [
    createUpdateLicenses,
    { loading: isCreateUpdateLicensesLoading },
  ] = useCustomMutation(createUpdateLicensesMutation);

  const handleClickSave = async () => {
    const response = await createUpdateLicenses({
      variables: {
        company_id: companyId,
        company_licenses: companyLicenses,
      },
    });

    if (response.status !== "OK") {
      snackbar.showError(`Could not update licenses. Error: ${response.msg}`);
    } else {
      snackbar.showSuccess("Licenses updated.");
      handleClose();
    }
  };

  const isSubmitDisabled =
    isVendorCompanyFileAttachmentsLoading || isCreateUpdateLicensesLoading;

  return vendor ? (
    <Modal
      isPrimaryActionDisabled={isSubmitDisabled}
      title={"Update Licenses"}
      primaryActionText={"Save"}
      handleClose={handleClose}
      handlePrimaryAction={handleClickSave}
    >
      <Box display="flex" flexDirection="column">
        <Box>
          <Typography variant="h6">Licenses</Typography>
        </Box>
        <Box mt={1} mb={2}>
          {companyLicenses.map((companyLicense, index) => (
            <CompanyLicenseForm
              key={index}
              companyId={companyId}
              licenseIndex={index}
              companyLicense={companyLicense}
              setCompanyLicenses={setCompanyLicenses}
            />
          ))}
        </Box>
        <Box mt={2}>
          <Button
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
      </Box>
    </Modal>
  ) : null;
}
