import {
  Box,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
} from "@material-ui/core";
import Modal from "components/Shared/Modal/Modal";
import {
  ReportGenerationReq,
  sendMonthlySummaryLOCReport,
  sendMonthlySummaryNonLOCReport,
} from "lib/api/reports";
import { useLastMonthlySummaryReportLiveRunQuery } from "generated/graphql";
import { formatDatetimeString } from "lib/date";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { isEmailValid } from "lib/validation";
import { ChangeEvent, useState } from "react";

interface Props {
  handleClose: () => void;
}

export default function KickoffMonthlySummaryEmailsModal({
  handleClose,
}: Props) {
  const snackbar = useSnackbar();
  const [email, setEmail] = useState("");
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

  const [
    sendLOCReport,
    { loading: isSendLOCReportLoading },
  ] = useCustomMutation(sendMonthlySummaryLOCReport);

  const [
    sendNonLOCReport,
    { loading: isSendNonLOCReportLoading },
  ] = useCustomMutation(sendMonthlySummaryNonLOCReport);

  const handleSendReports = async () => {
    const request: ReportGenerationReq = {
      variables: {
        isTest: isTestRun,
        email: email,
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
        `Could not send out test emails! Error: ${errorMessage}`
      );
    } else {
      snackbar.showSuccess(
        "Test emails successfully sent out. Please check your inbox."
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
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setIsTestRun(event.target.checked)
              }
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
      </Box>
    </Modal>
  );
}
