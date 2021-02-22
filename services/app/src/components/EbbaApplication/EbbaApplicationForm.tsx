import {
  Box,
  createStyles,
  FormControl,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import CurrencyTextField from "@unicef/material-ui-currency-textfield";
import DatePicker from "components/Shared/Dates/DatePicker";
import DownloadThumbnail from "components/Shared/File/DownloadThumbnail";
import FileUploadDropzone from "components/Shared/File/UploadDropzone";
import {
  EbbaApplicationFilesInsertInput,
  EbbaApplicationsInsertInput,
  Scalars,
} from "generated/graphql";
import { formatCurrency } from "lib/currency";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    inputField: {
      width: 300,
    },
  })
);

interface Props {
  companyId: Scalars["uuid"];
  calculatedBorrowingBase: number | null;
  ebbaApplication: EbbaApplicationsInsertInput;
  ebbaApplicationFiles: EbbaApplicationFilesInsertInput[];
  setEbbaApplication: (ebbaApplication: EbbaApplicationsInsertInput) => void;
  setEbbaApplicationFiles: (
    ebbaApplicationFiles: EbbaApplicationFilesInsertInput[]
  ) => void;
}

function EbbaApplicationForm({
  companyId,
  calculatedBorrowingBase,
  ebbaApplication,
  ebbaApplicationFiles,
  setEbbaApplication,
  setEbbaApplicationFiles,
}: Props) {
  const classes = useStyles();

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" flexDirection="row" mt={2}>
        <DatePicker
          className={classes.inputField}
          id="application-month-date-picker"
          label="Application Month"
          disablePast={false}
          value={ebbaApplication.application_month}
          onChange={(value) =>
            setEbbaApplication({
              ...ebbaApplication,
              application_month: value,
            })
          }
        />
      </Box>
      <Box display="flex" flexDirection="row" mt={2}>
        <FormControl className={classes.inputField}>
          <CurrencyTextField
            label="Accounts Receivable This Month ($)"
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
        <FormControl className={classes.inputField}>
          <CurrencyTextField
            label="Inventory This Month ($)"
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
        <FormControl className={classes.inputField}>
          <CurrencyTextField
            label="Cash This Month ($)"
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
      <Box display="flex" flexDirection="column" mt={2}>
        <Typography variant="body1">{`Calculated Borrowing Base: ${
          calculatedBorrowingBase
            ? formatCurrency(calculatedBorrowingBase)
            : "TBD"
        }`}</Typography>
        <Typography variant="body2" color="textSecondary">
          This borrowing base is calculated based on the numbers you entered
          above and your current active contract with Bespoke.
        </Typography>
      </Box>
      <Box mt={3}>
        <Box mb={1}>
          <Typography variant="subtitle1" color="textSecondary">
            File Attachment(s)
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Please upload file attachment(s) that serve as proof of the above
            numbers. One file attachment for each number is preferred.
          </Typography>
        </Box>
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
