import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Theme,
  Typography,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import useSnackbar from "hooks/useSnackbar";
import { deletePartnershipRequestMutation } from "lib/api/companies";

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
  partnerRequest: any;
  handleClose: () => void;
}

export default function DeletePartnershipRequestModal({
  partnerRequest,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();
  const classes = useStyles();

  const isSubmitDisabled = false;

  const handleSubmit = async () => {
    const response = await deletePartnershipRequestMutation({
      variables: {
        partnership_request_id: partnerRequest.id,
      },
    });
    if (response.status !== "OK") {
      snackbar.showError(
        `Error! Could not delete partnership. Reason: ${response.msg}`
      );
    } else {
      snackbar.showSuccess("Partnership deleted");
      handleClose();
    }
  };

  return (
    <Dialog
      open
      onClose={handleClose}
      maxWidth="lg"
      classes={{ paper: classes.dialog }}
    >
      <DialogTitle className={classes.dialogTitle}>
        Delete Partnership Request
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please confirm before deleting the partnership request. Deleting this
          request means the partnership will not be formed as the user
          requested.
        </DialogContentText>
        <Box display="flex" flexDirection="column">
          <Typography variant="subtitle2" color="textSecondary">
            Requesting Company
          </Typography>
          <Typography variant={"body1"}>
            {partnerRequest.requesting_company.name}
          </Typography>
        </Box>
        <Box mb={2} mt={2}>
          <Divider />
        </Box>
        <Box display="flex" flexDirection="column" mb={1}>
          <Typography variant="subtitle2" color="textSecondary">
            New Partner Type
          </Typography>
          <Typography variant={"body1"}>
            {partnerRequest.company_type}
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column" mb={1}>
          <Typography variant="subtitle2" color="textSecondary">
            New Partner Name
          </Typography>
          <Typography variant={"body1"}>
            {partnerRequest.company_name}
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column">
          <Typography variant="subtitle2" color="textSecondary">
            New Partner License IDs
          </Typography>
          <Typography variant={"body1"}>
            {partnerRequest.license_info
              ? partnerRequest.license_info.license_ids.join(", ")
              : ""}
          </Typography>
        </Box>
        <Box mb={2} mt={2}>
          <Divider />
        </Box>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Button variant={"contained"} color={"default"} onClick={handleClose}>
          Cancel
        </Button>
        <Button
          disabled={isSubmitDisabled}
          variant={"contained"}
          color={"secondary"}
          onClick={handleSubmit}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
