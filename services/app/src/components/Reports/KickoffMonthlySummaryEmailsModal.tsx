import {
  Box,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
  makeStyles,
} from "@material-ui/core";
import CompanyMonthlySummariesDataGrid from "components/Reports/CompanyMonthlySummariesDataGrid";
import DateInput from "components/Shared/FormInputs/DateInput";
import Modal from "components/Shared/Modal/Modal";
import {
  RecentMonthlyCalculationsFragment,
  useGetMostRecentMonthlyCalculationsQuery,
  useLastMonthlySummaryReportLiveRunQuery,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import {
  ReportGenerationReq,
  sendMonthlySummaryLOCReport,
  sendMonthlySummaryNonLOCReport,
} from "lib/api/reports";
import { formatDatetimeString } from "lib/date";
import { isEmailValid } from "lib/validation";
import { ChangeEvent, useMemo, useState } from "react";

interface Props {
  handleClose: () => void;
}

const useStyles = makeStyles({
  datePicker: {
    width: 300,
    marginTop: 0,
    marginBottom: 0,
  },
});

export default function KickoffMonthlySummaryEmailsModal({
  handleClose,
}: Props) {
  const classes = useStyles();
  const snackbar = useSnackbar();
  const [email, setEmail] = useState("");
  const [asOfDate, setAsOfDate] = useState("");
  const [isTestRun, setIsTestRun] = useState(false);

  // Display who last ran the live report button and when
  const { data: lastRun } = useLastMonthlySummaryReportLiveRunQuery();
  const lastRunUser =
    !!lastRun && lastRun?.sync_pipelines.length > 0
      ? lastRun?.sync_pipelines[0].internal_state?.user_name
      : null;
  const lastRunDatetime =
    !!lastRun && lastRun?.sync_pipelines.length > 0
      ? formatDatetimeString(lastRun?.sync_pipelines[0].created_at)
      : null;

  // Get Company name and last run date info for data grid
  const { data: lastRunDateData } = useGetMostRecentMonthlyCalculationsQuery();

  const latestCompanyData = !!lastRunDateData?.companies
    ? lastRunDateData.companies
    : [];
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<
    RecentMonthlyCalculationsFragment["id"][]
  >([]);

  const handleSelectCompanies = useMemo(
    () => (companies: RecentMonthlyCalculationsFragment[]) =>
      setSelectedCompanyIds(companies.map((company) => company.id)),
    [setSelectedCompanyIds]
  );

  const [sendLOCReport, { loading: isSendLOCReportLoading }] =
    useCustomMutation(sendMonthlySummaryLOCReport);

  const [sendNonLOCReport, { loading: isSendNonLOCReportLoading }] =
    useCustomMutation(sendMonthlySummaryNonLOCReport);

  const handleSendReports = async () => {
    const request: ReportGenerationReq = {
      variables: {
        isTest: isTestRun,
        email: email,
        asOfDate: asOfDate,
        companies: selectedCompanyIds,
      },
    };
    const nonLOCResponse = await sendNonLOCReport(request);
    const locResponse = await sendLOCReport(request);

    const errorMessage =
      (nonLOCResponse.status !== "OK" ? nonLOCResponse.msg : "") +
      " " +
      (locResponse.status !== "OK" ? locResponse.msg : "");

    if (nonLOCResponse.status !== "OK" || locResponse.status !== "OK") {
      snackbar.showError(
        `Could not send out ${
          isTestRun ? "test" : "live"
        } emails! Error: ${errorMessage}`
      );
    } else {
      snackbar.showSuccess(
        `${
          isTestRun ? "Test" : "Live"
        } emails successfully sent out. Please check your inbox.`
      );
      handleClose();
    }
  };

  return (
    <Modal
      dataCy={"kickoff-monthly-summary-emails-modal"}
      title={"Kickoff Monthly Summary Emails"}
      isPrimaryActionDisabled={
        isSendNonLOCReportLoading ||
        isSendLOCReportLoading ||
        asOfDate === "" ||
        (isTestRun && !isEmailValid(email))
      }
      primaryActionText={isTestRun ? "Send Test Reports" : "Send Live Reports"}
      handleClose={handleClose}
      handlePrimaryAction={handleSendReports}
    >
      <Box display="flex" flexDirection="column">
        <Box display="flex" flexDirection="column">
          <Typography variant={"body2"}>
            <strong>Instructions for Monthly Report Generation</strong>
          </Typography>
          <Typography variant={"subtitle2"} color={"textSecondary"}>
            Please select the test run button below if you aren't ready for this
            to send to clients. Doing so will enable you to enter an email that
            will receive the results of the test run. If the test run button is
            not selected, the email will go to the full recipient list.
          </Typography>
        </Box>
      </Box>

      <Box display="flex" flexDirection="column" mt={4}>
        <FormControlLabel
          control={
            <Checkbox
              checked={isTestRun}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                setEmail("");
                setIsTestRun(event.target.checked);
              }}
              color="primary"
            />
          }
          label={"Is this an email test run?"}
        />
        {!!lastRunUser && lastRunDatetime && (
          <Box display="flex" flexDirection="column" mt={4}>
            <Typography variant={"body2"}>
              <strong>Last Live Run</strong>
            </Typography>
            <Typography variant={"subtitle2"} color={"textSecondary"}>
              The <strong>live</strong> report generation function was last run
              on {lastRunDatetime} by {lastRunUser}.
            </Typography>
          </Box>
        )}
        {isTestRun && (
          <Box display="flex" flexDirection="column" mt={4}>
            <Typography variant={"body2"}>
              <strong>Email Recipient</strong>
            </Typography>
            <Typography variant={"subtitle2"} color={"textSecondary"}>
              If the checkbox for if test run is selected, please make sure to
              enter an email below that will receive the test run.
            </Typography>
            <TextField
              label="Email"
              value={email}
              disabled={!isTestRun}
              required={isTestRun}
              onChange={({ target: { value } }) => setEmail(value)}
            />
          </Box>
        )}
        <Box display="flex" flexDirection="column" mt={4}>
          <Typography variant={"body2"}>
            <strong>As of Date</strong>
          </Typography>
          <Typography variant={"subtitle2"} color={"textSecondary"}>
            Please use the data picker to select a data to run the report
            generation up until. For example, if you select 1/31/2022, you will
            generate and send reports for January 2022. If you select 1/20/2022,
            the generated reports will only include up to January 20th.
          </Typography>
          <DateInput
            dataCy={"cy-report-as-of-date"}
            className={classes.datePicker}
            id={"report-as-of-date"}
            label={"Report Generation as of Date"}
            required={false}
            value={asOfDate || null}
            onChange={(value: any) => setAsOfDate(value)}
            disableFuture={true}
          />
        </Box>
        {(isSendLOCReportLoading || isSendNonLOCReportLoading) && (
          <Box display="flex" flexDirection="column" mt={4}>
            <Typography variant={"body2"}>
              <strong>Job Submitted</strong>
            </Typography>
            <Typography variant={"subtitle2"} color={"textSecondary"}>
              The report generation flow can take a moment, please be patient
              while this runs. The modal will automatically close once the job
              is finished.
            </Typography>
          </Box>
        )}
        <Box>
          <CompanyMonthlySummariesDataGrid
            isMultiSelectEnabled={true}
            companies={latestCompanyData}
            selectedCompanyIds={selectedCompanyIds}
            handleSelectCompanies={handleSelectCompanies}
          />
        </Box>
      </Box>
    </Modal>
  );
}
