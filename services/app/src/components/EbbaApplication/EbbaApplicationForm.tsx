import {
  Box,
  createStyles,
  FormControl,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import DownloadThumbnail from "components/Shared/File/DownloadThumbnail";
import FileUploadDropzone from "components/Shared/File/UploadDropzone";
import CurrencyInput from "components/Shared/FormInputs/CurrencyInput";
import DatePicker from "components/Shared/FormInputs/DatePicker";
import {
  EbbaApplicationFilesInsertInput,
  EbbaApplicationsInsertInput,
  Scalars,
} from "generated/graphql";
import { formatCurrency } from "lib/currency";
import { useMemo } from "react";
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    inputField: {
      width: 300,
    },
  })
);

interface Props {
  isAccountsReceivableVisible: boolean;
  isInventoryVisible: boolean;
  isCashVisible: boolean;
  isCashInDacaVisible: boolean;
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
  isAccountsReceivableVisible,
  isInventoryVisible,
  isCashVisible,
  isCashInDacaVisible,
  companyId,
  calculatedBorrowingBase,
  ebbaApplication,
  ebbaApplicationFiles,
  setEbbaApplication,
  setEbbaApplicationFiles,
}: Props) {
  const classes = useStyles();

  const ebbaApplicationFileIds = useMemo(
    () =>
      ebbaApplicationFiles.map(
        (ebbaApplicationFile) => ebbaApplicationFile.file_id
      ),
    [ebbaApplicationFiles]
  );

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" flexDirection="column" mt={2}>
        <Typography variant="subtitle2">
          What date would you like to submit a certification for?
        </Typography>
        <Box mt={1}>
          <DatePicker
            disableFuture
            required
            className={classes.inputField}
            id="application-month-date-picker"
            label="Certification Date"
            disablePast={false}
            value={ebbaApplication.application_date}
            onChange={(value) =>
              setEbbaApplication({
                ...ebbaApplication,
                application_date: value,
              })
            }
          />
        </Box>
      </Box>
      {isAccountsReceivableVisible && (
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2">
            For the month of the date you specified above, how much accounts
            receivable do you have?
          </Typography>
          <Box mt={1}>
            <FormControl className={classes.inputField}>
              <CurrencyInput
                isRequired
                label={"Accounts Receivable ($)"}
                value={ebbaApplication.monthly_accounts_receivable}
                handleChange={(value: number) => {
                  setEbbaApplication({
                    ...ebbaApplication,
                    monthly_accounts_receivable: value,
                  });
                }}
              />
            </FormControl>
          </Box>
        </Box>
      )}
      {isInventoryVisible && (
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2">
            For the month of the date you specified above, how much inventory do
            you have?
          </Typography>
          <Box mt={1}>
            <FormControl className={classes.inputField}>
              <CurrencyInput
                isRequired
                label={"Inventory ($)"}
                value={ebbaApplication.monthly_inventory}
                handleChange={(value: number) => {
                  setEbbaApplication({
                    ...ebbaApplication,
                    monthly_inventory: value,
                  });
                }}
              />
            </FormControl>
          </Box>
        </Box>
      )}
      {isCashVisible && (
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2">
            As of the date you specified above, how much cash do you have in
            Deposit Accounts(s)?
          </Typography>
          <Box mt={1}>
            <FormControl className={classes.inputField}>
              <CurrencyInput
                isRequired
                label={"Cash in Deposit Account(s)"}
                value={ebbaApplication.monthly_cash}
                handleChange={(value: number) => {
                  setEbbaApplication({
                    ...ebbaApplication,
                    monthly_cash: value,
                  });
                }}
              />
            </FormControl>
          </Box>
        </Box>
      )}
      {isCashInDacaVisible && (
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2">
            As of the date you specified above, how much cash do you have in
            DACA Deposit Account(s)?
          </Typography>
          <Box mt={1}>
            <FormControl className={classes.inputField}>
              <CurrencyInput
                isRequired
                label={"Cash in DACA Deposit Account(s)"}
                value={ebbaApplication.amount_cash_in_daca}
                handleChange={(value: number) => {
                  setEbbaApplication({
                    ...ebbaApplication,
                    amount_cash_in_daca: value,
                  });
                }}
              />
            </FormControl>
          </Box>
        </Box>
      )}
      <Box display="flex" flexDirection="column" mt={3}>
        <Typography variant="body1">{`Calculated Borrowing Base: ${
          calculatedBorrowingBase !== null
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
          <DownloadThumbnail fileIds={ebbaApplicationFileIds} />
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
