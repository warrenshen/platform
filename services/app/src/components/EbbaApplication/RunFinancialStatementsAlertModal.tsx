import {
  Box,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
} from "@material-ui/core";
import CustomersDataGrid from "components/Customer/CustomersDataGrid";
import Modal from "components/Shared/Modal/Modal";
import {
  CustomersWithMetadataFragment,
  useGetActiveCustomersWithMetadataQuery,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import {
  SendFinancialStatementAlertReq,
  sendFinancialStatementAlert,
} from "lib/api/ebbaApplications";
import { todayAsDateStringServer } from "lib/date";
import { isEmailValid } from "lib/validation";
import { ChangeEvent, useState } from "react";

interface Props {
  handleClose: () => void;
}

export default function RunFinancialStatementsAlertModal({
  handleClose,
}: Props) {
  const snackbar = useSnackbar();
  const [email, setEmail] = useState("");
  const [isTestRun, setIsTestRun] = useState(false);

  // Get Company name and last run date info for data grid
  const { data: activeData, error: allActiveError } =
    useGetActiveCustomersWithMetadataQuery({
      fetchPolicy: "network-only",
      variables: {
        date: todayAsDateStringServer(),
      },
    });

  if (allActiveError) {
    console.error({ allActiveError });
    alert(`Error in query (details in console): ${allActiveError.message}`);
  }

  const companies = activeData?.customers || [];

  const [selectedCompanyIds, setSelectedCompanyIds] = useState<
    CustomersWithMetadataFragment["id"][]
  >([]);

  const [sendAlert, { loading: isSendAlertLoading }] = useCustomMutation(
    sendFinancialStatementAlert
  );

  const handleSendAlerts = async () => {
    const request: SendFinancialStatementAlertReq = {
      variables: {
        isTest: isTestRun,
        email: email,
        companies: selectedCompanyIds,
      },
    };
    const sendAlertResponse = await sendAlert(request);

    if (sendAlertResponse.status !== "OK") {
      snackbar.showError(
        `Could not send out ${isTestRun ? "test" : "live"} emails! Error: ${
          sendAlertResponse.msg
        }`
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
      dataCy={"Run-financial-statements-alert-modal"}
      title={"Run Financial Statements Alert"}
      isPrimaryActionDisabled={
        isSendAlertLoading || (isTestRun && !isEmailValid(email))
      }
      primaryActionText={isTestRun ? "Send Test Alerts" : "Send Live Alerts"}
      handleClose={handleClose}
      handlePrimaryAction={handleSendAlerts}
    >
      <Box display="flex" flexDirection="column">
        <Box display="flex" flexDirection="column">
          <Typography variant={"body2"}>
            <strong>Instructions for Monthly Statement Reminder</strong>
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
        <Box>
          {isSendAlertLoading && (
            <Box display="flex" flexDirection="column" mt={4}>
              <Typography variant={"body2"}>
                <strong>Job Submitted</strong>
              </Typography>
            </Box>
          )}
        </Box>
        <Box>
          <CustomersDataGrid
            isMultiSelectEnabled={true}
            customers={companies}
            selectedCompanyIds={selectedCompanyIds}
            setSelectedCompanyIds={setSelectedCompanyIds}
          />
        </Box>
      </Box>
    </Modal>
  );
}
