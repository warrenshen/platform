import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Theme,
  Typography,
  createStyles,
  makeStyles,
} from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialog: {
      minWidth: "500px",
    },
    dialogTitle: {
      borderBottom: "1px solid #c7c7c7",
    },
    purchaseOrderInput: {
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
  companyName: string;
  surveillanceStatusNote: string;
  handleClose: () => void;
}

export default function CustomerSurveillanceStatusNoteModal({
  companyName,
  surveillanceStatusNote,
  handleClose,
}: Props) {
  const classes = useStyles();

  return (
    <Dialog
      open
      onClose={handleClose}
      maxWidth="xl"
      classes={{ paper: classes.dialog }}
    >
      <DialogTitle className={classes.dialogTitle}>
        Customer's Surveillance Status Note
      </DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column">
          <Box display="flex" flexDirection="column">
            <Box mt={2}>
              <Typography variant="body1">
                {`Customers: ${companyName}`}
              </Typography>
            </Box>
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <TextField
              autoFocus
              multiline
              disabled
              label={"Surveillance Status Note"}
              value={surveillanceStatusNote}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Box>
          <Button onClick={handleClose}>Cancel</Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
