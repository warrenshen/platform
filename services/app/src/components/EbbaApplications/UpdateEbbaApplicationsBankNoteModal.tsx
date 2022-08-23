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
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { updateBorrowingBaseBankNoteMutation } from "lib/api/ebbaApplications";
import { useState } from "react";

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
  ebbaApplication: any;
  handleClose: () => void;
}

export default function UpdateEbbaApplicationBankNoteModal({
  ebbaApplication,
  handleClose,
}: Props) {
  const classes = useStyles();
  const snackbar = useSnackbar();

  const [bankNote, setBankNote] = useState<string>(ebbaApplication.bank_note);

  const [
    editEbbaApplicationBankNote,
    { loading: isEditEbbaApplicationBankNoteLoading },
  ] = useCustomMutation(updateBorrowingBaseBankNoteMutation);

  const handleClickSave = async () => {
    const response = await editEbbaApplicationBankNote({
      variables: {
        companyId: ebbaApplication.company.id,
        ebbaApplicationId: ebbaApplication.id,
        bankNote,
      },
    });
    if (response.status !== "OK") {
      snackbar.showError("Could not update Borrowing Base Bank Note.");
    } else {
      snackbar.showSuccess("Borrowing Base Bank Note updated.");
      handleClose();
    }
  };

  const isFormLoading = isEditEbbaApplicationBankNoteLoading;
  const isSaveDisabled = isFormLoading;

  return (
    <Dialog
      open
      onClose={handleClose}
      maxWidth="xl"
      classes={{ paper: classes.dialog }}
    >
      <DialogTitle className={classes.dialogTitle}>
        {`Edit ${
          ebbaApplication.category === "borrowing_base"
            ? "Borrowing Base"
            : "Financial Certification"
        }  Bank Note`}
      </DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column">
          <Box display="flex" flexDirection="column">
            <Box mt={2}>
              <Typography variant="body1">
                {`Customer: ${ebbaApplication.company.name}`}
              </Typography>
            </Box>
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <TextField
              autoFocus
              multiline
              label={"Bank Note"}
              helperText={"Only Bespoke Financial users can view this note"}
              value={bankNote}
              onChange={({ target: { value } }) => setBankNote(value)}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Box>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            className={classes.submitButton}
            disabled={isSaveDisabled}
            onClick={handleClickSave}
            variant="contained"
            color="primary"
          >
            Save
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
