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
} from "@material-ui/core";
import { Scalars, useLoanQuery } from "generated/graphql";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialog: {
      width: 400,
    },
    dialogTitle: {
      paddingLeft: theme.spacing(3),
      borderBottom: "1px solid #c7c7c7",
    },
    buttonClass: {
      marginLeft: theme.spacing(1),
    },
    propertyLabel: {
      flexGrow: 1,
    },
    constLabels: {
      minWidth: 150,
    },
    dialogActions: {
      margin: theme.spacing(2),
      marginTop: 0,
      marginBottom: theme.spacing(2),
    },
  })
);

interface Props {
  loanId: Scalars["uuid"];
  handleClose: () => void;
}

function ViewLoanModal({ loanId, handleClose }: Props) {
  const classes = useStyles();
  const { data } = useLoanQuery({
    variables: {
      id: loanId,
    },
  });
  const loan = data?.loans_by_pk;

  return loan ? (
    <Dialog
      open
      onClose={handleClose}
      maxWidth="xl"
      classes={{ paper: classes.dialog }}
    >
      <DialogTitle className={classes.dialogTitle}>Loan Details</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column">
          <Box display="flex" flexDirection="row" mt={1}>
            <p className={classes.propertyLabel}>
              <strong>Loan ID:</strong>
            </p>
            <p>{loan.id}</p>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Box>
          <Button
            className={classes.buttonClass}
            variant="contained"
            color="default"
            onClick={handleClose}
          >
            Close
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  ) : null;
}

export default ViewLoanModal;
