import {
  Box,
  createStyles,
  FormControl,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  Theme,
  Typography,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import FileUploader from "components/Shared/File/FileUploader";
import {
  EbbaApplicationFilesInsertInput,
  EbbaApplicationsInsertInput,
  Scalars,
} from "generated/graphql";
import {
  formatDateString,
  formatDateStringAsMonth,
  lastThreeMonthsCertificationDates,
} from "lib/date";
import { FileTypeEnum } from "lib/enum";
import { useMemo } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    inputField: {
      width: "100%",
    },
  })
);

interface Props {
  companyId: Scalars["uuid"];
  ebbaApplication: EbbaApplicationsInsertInput;
  ebbaApplicationFiles: EbbaApplicationFilesInsertInput[];
  setEbbaApplication: (ebbaApplication: EbbaApplicationsInsertInput) => void;
  setEbbaApplicationFiles: (
    ebbaApplicationFiles: EbbaApplicationFilesInsertInput[]
  ) => void;
}

export default function EbbaApplicationFinancialReportsForm({
  companyId,
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
      <Box display="flex" flexDirection="column" mt={4}>
        <Typography variant="subtitle2">
          What month would you like to submit financial reports for?
        </Typography>
        <Box mt={1}>
          <FormControl className={classes.inputField}>
            <InputLabel id="select-certification-date-label" required>
              Certification Date
            </InputLabel>
            <Select
              id="select-certification-date"
              labelId="select-certification-date-label"
              value={ebbaApplication.application_date}
              onChange={({ target: { value } }) =>
                setEbbaApplication({
                  ...ebbaApplication,
                  application_date: value,
                })
              }
            >
              {lastThreeMonthsCertificationDates().map(
                (dateStringServer, index) => (
                  <MenuItem key={index} value={dateStringServer}>
                    {`${formatDateStringAsMonth(
                      dateStringServer
                    )}: Submit financials as of ${formatDateString(
                      dateStringServer
                    )}`}
                  </MenuItem>
                )
              )}
            </Select>
          </FormControl>
        </Box>
      </Box>
      <Box mt={4}>
        <Alert severity="info">
          <Typography variant="body1">
            {`Important: all financial values provided below should be AS OF the certification date specified above.`}
          </Typography>
        </Alert>
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <Box mb={1}>
          <Typography variant="subtitle1" color="textSecondary">
            File Attachment(s)
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Please upload file attachment(s) that serve as proof of the above
            financial information. One file attachment for each number is
            preferred.
          </Typography>
        </Box>
        <FileUploader
          companyId={companyId}
          fileType={FileTypeEnum.EBBA_APPLICATION}
          fileIds={ebbaApplicationFileIds}
          handleDeleteFileById={(fileId) =>
            setEbbaApplicationFiles(
              ebbaApplicationFiles.filter(
                (ebbaApplicationFile) => ebbaApplicationFile.file_id !== fileId
              )
            )
          }
          handleNewFiles={(files) =>
            setEbbaApplicationFiles([
              ...ebbaApplicationFiles,
              ...files.map((file) => ({
                ebba_application_id: ebbaApplication.id,
                file_id: file.id,
              })),
            ])
          }
        />
      </Box>
    </Box>
  );
}
