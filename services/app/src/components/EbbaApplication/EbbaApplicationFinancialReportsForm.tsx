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
import FileUploader from "components/Shared/File/FileUploader";
import {
  EbbaApplicationFilesInsertInput,
  EbbaApplicationsInsertInput,
  Scalars,
  useGetEbbaApplicationsByCompanyIdQuery,
} from "generated/graphql";
import {
  formatDateString,
  formatDateStringAsMonth,
  previousXMonthsCertificationDates,
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
  isActionTypeUpdate: boolean;
  isBankUser: boolean;
  companyId: Scalars["uuid"];
  ebbaApplication: EbbaApplicationsInsertInput;
  ebbaApplicationFiles: EbbaApplicationFilesInsertInput[];
  setEbbaApplication: (ebbaApplication: EbbaApplicationsInsertInput) => void;
  setEbbaApplicationFiles: (
    ebbaApplicationFiles: EbbaApplicationFilesInsertInput[]
  ) => void;
}

export default function EbbaApplicationFinancialReportsForm({
  isActionTypeUpdate,
  isBankUser,
  companyId,
  ebbaApplication,
  ebbaApplicationFiles,
  setEbbaApplication,
  setEbbaApplicationFiles,
}: Props) {
  const classes = useStyles();

  const { data, error } = useGetEbbaApplicationsByCompanyIdQuery({
    fetchPolicy: "network-only",
    variables: {
      company_id: companyId,
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const certificationDateOptions = useMemo(() => {
    const existingEbbaApplications = data?.ebba_applications || [];
    const existingEbbaApplicationDates = existingEbbaApplications.map(
      (ebbaApplication) => ebbaApplication.application_date
    );
    // 1. Allow bank user to select months up to 12 months back.
    // 2. Allow customer user to selects months up to 4 months back.
    return previousXMonthsCertificationDates(isBankUser ? 12 : 4).map(
      (certificationDate) => ({
        isDisabled:
          existingEbbaApplicationDates.indexOf(certificationDate) >= 0,
        certificationDate,
      })
    );
  }, [isBankUser, data?.ebba_applications]);

  const ebbaApplicationFileIds = useMemo(
    () =>
      ebbaApplicationFiles.map(
        (ebbaApplicationFile) => ebbaApplicationFile.file_id
      ),
    [ebbaApplicationFiles]
  );

  const selectedCertificationDate = ebbaApplication.application_date
    ? formatDateString(ebbaApplication.application_date)
    : "";

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" flexDirection="column" mt={4}>
        {!isActionTypeUpdate && (
          <Box mb={1}>
            <Typography variant="subtitle2">
              What month would you like to submit financial reports for?
            </Typography>
          </Box>
        )}
        <Box>
          <FormControl className={classes.inputField}>
            <InputLabel id="select-certification-date-label" required>
              Certification Month
            </InputLabel>
            <Select
              id="select-certification-date"
              labelId="select-certification-date-label"
              disabled={isActionTypeUpdate}
              value={ebbaApplication.application_date}
              onChange={({ target: { value } }) =>
                setEbbaApplication({
                  ...ebbaApplication,
                  application_date: value,
                })
              }
            >
              {certificationDateOptions.map(
                ({ certificationDate, isDisabled }) => (
                  <MenuItem
                    key={certificationDate}
                    disabled={isDisabled}
                    value={certificationDate}
                  >
                    {`${formatDateStringAsMonth(
                      certificationDate
                    )}: submit financial reports as of ${formatDateString(
                      certificationDate
                    )}`}
                  </MenuItem>
                )
              )}
            </Select>
          </FormControl>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <Box mb={2}>
          <Box>
            <Typography variant="subtitle1" color="textSecondary">
              Please upload the following required financial reports:
            </Typography>
          </Box>
          <Box mt={0.5}>
            <Typography variant="body1">
              {`Balance Sheet as of: ${selectedCertificationDate}`}
            </Typography>
          </Box>
          <Box mt={0.5}>
            <Typography variant="body1">
              {`Monthly Income Statement as of: ${selectedCertificationDate}`}
            </Typography>
          </Box>
          <Box mt={0.5}>
            <Typography variant="body1">
              {`A/R Aging Summary Report as of: ${selectedCertificationDate}`}
            </Typography>
          </Box>
          <Box mt={0.5}>
            <Typography variant="body1">
              {`A/P Aging Summary Report as of: ${selectedCertificationDate}`}
            </Typography>
          </Box>
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
