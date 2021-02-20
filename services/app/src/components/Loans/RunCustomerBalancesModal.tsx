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
import DatePicker from "components/Shared/Dates/DatePicker";
import { Companies } from "generated/graphql";
import { runCustomerBalances } from "lib/finance/loans/reports";
import { useSnackbar } from "material-ui-snackbar-provider";
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

  const [reportDate, setReportDate] = useState<string | null>(null);

  const handleClickSubmit = async () => {
    if (!reportDate) {
    } else {
      // Note: companyId below may be undefined. This is valid in the case
      // that we want to run balances for all customers.
      const response = await runCustomerBalances({
        company_id: companyId,
        report_date: reportDate,
      });

      console.log({ type: "runCustomerBalances", response });

      if (response.status !== "OK") {
        snackbar.showMessage(
          "Error! Could not re-calculate customer balances."
        );
      } else {
        snackbar.showMessage("Success! Customer balances recalculated.");
        handleClose();
      }
    }
  };

  const isSaveDisabled = !reportDate;

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
          {`Select a Report Date below. This report date will be used as "today"
          to re-calculate balances for all loans of ${
            companyId ? "this customer" : "all customers"
          }. For example,
          a report date of "02/18/20" will result in the balances of all loans
          of this customer being calculated as if today is "02/18/20".`}
        </Typography>
        <Box display="flex" flexDirection="column" mt={2}>
          <DatePicker
            id="report-date-date-picker"
            label="Report Date"
            value={reportDate}
            onChange={(value) => setReportDate(value)}
          />
        </Box>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Box>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            className={classes.submitButton}
            disabled={isSaveDisabled}
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
