import { Box, FormControl, Typography } from "@material-ui/core";
import CurrencyTextField from "@unicef/material-ui-currency-textfield";
import DownloadThumbnail from "components/Shared/File/DownloadThumbnail";
import FileUploadDropzone from "components/Shared/File/UploadDropzone";
import {
  EbbaApplicationFilesInsertInput,
  EbbaApplicationsInsertInput,
  Scalars,
} from "generated/graphql";

interface Props {
  companyId: Scalars["uuid"];
  ebbaApplication: EbbaApplicationsInsertInput;
  ebbaApplicationFiles: EbbaApplicationFilesInsertInput[];
  setEbbaApplication: (ebbaApplication: EbbaApplicationsInsertInput) => void;
  setEbbaApplicationFiles: (
    ebbaApplicationFiles: EbbaApplicationFilesInsertInput[]
  ) => void;
}

function EbbaApplicationForm({
  companyId,
  ebbaApplication,
  ebbaApplicationFiles,
  setEbbaApplication,
  setEbbaApplicationFiles,
}: Props) {
  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" flexDirection="row" mt={2}>
        <FormControl fullWidth>
          <CurrencyTextField
            label="Monthly Accounts Receivable"
            currencySymbol="$"
            outputFormat="string"
            textAlign="left"
            value={ebbaApplication.monthly_accounts_receivable}
            onChange={(_event: any, value: string) => {
              setEbbaApplication({
                ...ebbaApplication,
                monthly_accounts_receivable: value,
              });
            }}
          />
        </FormControl>
      </Box>
      <Box display="flex" flexDirection="row" mt={2}>
        <FormControl fullWidth>
          <CurrencyTextField
            label="Monthly Inventory"
            currencySymbol="$"
            outputFormat="string"
            textAlign="left"
            value={ebbaApplication.monthly_inventory}
            onChange={(_event: any, value: string) => {
              setEbbaApplication({
                ...ebbaApplication,
                monthly_inventory: value,
              });
            }}
          />
        </FormControl>
      </Box>
      <Box display="flex" flexDirection="row" mt={2}>
        <FormControl fullWidth>
          <CurrencyTextField
            label="Monthly Cash"
            currencySymbol="$"
            outputFormat="string"
            textAlign="left"
            value={ebbaApplication.monthly_cash}
            onChange={(_event: any, value: string) => {
              setEbbaApplication({
                ...ebbaApplication,
                monthly_cash: value,
              });
            }}
          />
        </FormControl>
      </Box>
      <Box mt={3}>
        <Typography variant="subtitle1" color="textSecondary">
          File Attachment(s)
        </Typography>
        {ebbaApplicationFiles.length > 0 && (
          <DownloadThumbnail
            fileIds={ebbaApplicationFiles.map(
              (ebbaApplicationFile) => ebbaApplicationFile.file_id
            )}
          />
        )}
        <Box mt={1}>
          <FileUploadDropzone
            companyId={companyId}
            docType={"ebba_application"}
            onUploadComplete={async (response) => {
              if (!response.succeeded) {
                return;
              }
              const { files_in_db: files } = response;
              setEbbaApplicationFiles(
                files.map((file) => ({
                  ebba_application: ebbaApplication.id,
                  file_id: file.id,
                }))
              );
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default EbbaApplicationForm;
