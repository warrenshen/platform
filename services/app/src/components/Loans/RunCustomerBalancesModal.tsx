import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  FormControlLabel,
  Theme,
  Typography,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import StaticDateRangePicker from "components/Shared/DatePicker/StaticDateRangePicker";
import DateInput from "components/Shared/FormInputs/DateInput";
import { Companies } from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { DateInputIcon } from "icons";
import { todayAsDateStringServer } from "lib/date";
import { runCustomerBalancesMutation } from "lib/finance/loans/reports";
import { ChangeEvent, useState } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialog: {
      width: 400,
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
  companyName?: Companies["name"];
  recommendedStartDate?: string;
  recommendedEndDate?: string;
  handleClose: () => void;
}

export default function RunCustomerBalancesModal({
  companyId,
  companyName,
  recommendedStartDate,
  recommendedEndDate,
  handleClose,
}: Props) {
  const classes = useStyles();
  const snackbar = useSnackbar();

  const [startDate, setStartDate] = useState<string | null>(
    recommendedStartDate || todayAsDateStringServer()
  );
  const [reportDate, setReportDate] = useState<string | null>(
    recommendedEndDate || todayAsDateStringServer()
  );
  const [isRunImmediately, setIsRunImmediately] = useState(false);

  const [runCustomerBalances, { loading: isRunCustomerBalancesLoading }] =
    useCustomMutation(runCustomerBalancesMutation);

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
        },
      });
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
      <DialogContent>
        <Box>
          <Typography variant="h5">{"Run Balances"}</Typography>
        </Box>
        <Box mt={2} mb={2}>
          <Divider variant="fullWidth" />
        </Box>
        {recommendedStartDate && recommendedEndDate && (
          <Box>
            <StaticDateRangePicker
              displayStaticWrapperAs="desktop"
              calendars={1}
              value={[recommendedStartDate, recommendedEndDate]}
              disabled={true}
              onChange={() => {}}
              renderInput={(
                startProps: TextFieldProps,
                endProps: TextFieldProps
              ) => (
                <>
                  <TextField {...startProps} />
                  <Box m={{ mx: 2 }}> to </Box>
                  <TextField {...endProps} />
                </>
              )}
              rangeHighlightColor="#f6e8e8"
              selectedDateColor="#f6e8e8"
            />
            <Box mt={3} />
            <Typography variant="body2" color="textSecondary">
              {`The dates above need to be recalculated for: ${
                companyName ? companyName : "all customers"
              }.`}
            </Typography>
          </Box>
        )}
        <Typography variant="body2" color="textSecondary">
          {` After you press "Submit", a job will be queued to perform these calculations.`}
        </Typography>
        <Box display="flex" flexDirection="column" mt={2}>
          <DateInput
            id="start-date-date-picker"
            label="Start Date"
            value={startDate}
            onChange={(value) => setStartDate(value)}
            keyboardIcon={<DateInputIcon width="16px" height="16px" />}
          />
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          <DateInput
            id="end-date-date-picker"
            label="End Date"
            value={reportDate}
            onChange={(value) => setReportDate(value)}
            keyboardIcon={<DateInputIcon width="16px" height="16px" />}
          />
        </Box>
        {!!companyId && !!startDate && startDate === reportDate && (
          <Box display="flex" flexDirection="column" mt={2}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isRunImmediately}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setIsRunImmediately(event.target.checked)
                  }
                  color="primary"
                />
              }
              label={"Run Immediately?"}
            />
          </Box>
        )}
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
