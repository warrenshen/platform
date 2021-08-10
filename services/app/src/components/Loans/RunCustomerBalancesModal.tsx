import {
  Box,
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import DateInput from "components/Shared/FormInputs/DateInput";
import { Companies } from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { todayAsDateStringServer } from "lib/date";
import { runCustomerBalancesMutation } from "lib/finance/loans/reports";
import { useState } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialog: {
      width: 400,
    },
    dialogTitle: {
      borderBottom: "1px solid #c7c7c7",
    },
    dialogActions: {
      margin: theme.spacing(2),
    },
    submitButton: {
      marginLeft: theme.spacing(1),
    },
  })
);

interface Props {
  companyId?: Companies["id"];
  handleClose: () => void;
}

function RunCustomerBalancesModal({ companyId, handleClose }: Props) {
  const classes = useStyles();
  const snackbar = useSnackbar();

  const [startDate, setStartDate] = useState<string | null>(
    todayAsDateStringServer()
  );
  const [reportDate, setReportDate] = useState<string | null>(
    todayAsDateStringServer()
  );

  const [
    runCustomerBalances,
    { loading: isRunCustomerBalancesLoading },
  ] = useCustomMutation(runCustomerBalancesMutation);

  const handleClickSubmit = async () => {
    if (!reportDate) {
      console.error("Developer error!");
    } else {
      // Note: companyId below may be undefined. This is valid in the case
      // that we want to run balances for all customers.
      const response = await runCustomerBalances({
        variables: {
          company_id: companyId,
          start_date: startDate,
          report_date: reportDate,
          include_debug_info: false,
        },
      });

      console.log({ type: "runCustomerBalances", response });

      if (response.status !== "OK") {
        snackbar.showError(
          `Could not queue up job to calculate balances of customer(s). Reason: ${response.msg}`
        );
      } else {
        snackbar.showSuccess(
          "Queued up job to calculate balances of customer(s). This job will be run soon."
        );
        handleClose();
      }
    }
  };

  const isFormLoading = isRunCustomerBalancesLoading;
  const isCancelDisabled = isFormLoading;
  const isSubmitDisabled = isFormLoading || !startDate || !reportDate;

  return (
    <Dialog
      open
      onClose={handleClose}
      maxWidth="xl"
      classes={{ paper: classes.dialog }}
    >
      <DialogTitle className={classes.dialogTitle}>
        {companyId
          ? "Run Balances for Customer"
          : "Run Balances for All Customers"}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="textSecondary">
          {`Select a range of dates below: for each date in the range (inclusive) given,
          financials will be calculated for ${
            companyId ? "this customer" : "all customers"
          }. After you press "Submit", a job will be queued to perform these calculations.`}
        </Typography>
        <Box display="flex" flexDirection="column" mt={4}>
          <DateInput
            id="start-date-date-picker"
            label="Start Date"
            value={startDate}
            onChange={(value) => setStartDate(value)}
          />
        </Box>
        <Box display="flex" flexDirection="column" mt={4}>
          <DateInput
            id="end-date-date-picker"
            label="End Date"
            value={reportDate}
            onChange={(value) => setReportDate(value)}
          />
        </Box>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Box>
          <Button disabled={isCancelDisabled} onClick={handleClose}>
            Cancel
          </Button>
          <Button
            className={classes.submitButton}
            disabled={isSubmitDisabled}
            onClick={handleClickSubmit}
            variant="contained"
            color="primary"
          >
            Submit
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default RunCustomerBalancesModal;
