import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Theme,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { checkForDebtFacilityPastDueLoans } from "lib/api/debtFacility";

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
  handleClose: () => void;
}

function CheckForDebtFacilityPastDueLoansModal({ handleClose }: Props) {
  const snackbar = useSnackbar();
  const classes = useStyles();

  const [checkForPastDueLoans, { loading: isCheckForPastDueLoansLoading }] =
    useCustomMutation(checkForDebtFacilityPastDueLoans);

  const handleClickConfirm = async () => {
    const response = await checkForPastDueLoans({
      variables: {},
    });

    if (response.status !== "OK") {
      snackbar.showError(`Something went wrong. Error: ${response.msg}`);
    } else {
      snackbar.showSuccess(
        "Successfully searched for loans over 30 days past due with expired or no waivers."
      );
      handleClose();
    }
  };

  const isSubmitDisabled = isCheckForPastDueLoansLoading;

  return (
    <Box display="flex" alignItems="center">
      <Dialog
        open
        onClose={handleClose}
        maxWidth="lg"
        classes={{ paper: classes.dialog }}
      >
        <DialogTitle className={classes.dialogTitle}>
          Check For Past Due Loans
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            By clicking confirm, you will kick off a job searching for loans
            over 30 days past due that have expired or no waivers. If found, all
            loans with that company in a debt facility will require a new
            waiver.
          </DialogContentText>
        </DialogContent>
        <DialogActions className={classes.dialogActions}>
          <Button variant={"contained"} color={"default"} onClick={handleClose}>
            Cancel
          </Button>
          <Button
            disabled={isSubmitDisabled}
            variant={"contained"}
            color={"primary"}
            onClick={handleClickConfirm}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CheckForDebtFacilityPastDueLoansModal;
