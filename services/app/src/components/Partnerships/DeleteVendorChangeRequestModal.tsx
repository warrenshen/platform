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
import { deleteVendorChangeRequestMutation } from "lib/api/companies";
import {
  VendorChangeRequestsCategoryEnum,
  VendorChangeRequestsCategoryToLabel,
} from "lib/enum";

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
  vendorChangeRequest: any;
  handleClose: () => void;
}

export default function DeleteVendorChangeRequestModal({
  vendorChangeRequest,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();
  const classes = useStyles();

  const isSubmitDisabled = false;

  const userName = vendorChangeRequest?.requesting_user?.full_name || "";
  const company = vendorChangeRequest?.requesting_company?.name || "";

  const handleSubmit = async () => {
    const response = await deleteVendorChangeRequestMutation({
      variables: {
        vendor_change_request_id: vendorChangeRequest.id,
      },
    });
    if (response.status !== "OK") {
      snackbar.showError(
        `Error! Could not delete request. Reason: ${response.msg}`
      );
    } else {
      snackbar.showSuccess("Request deleted");
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
        Delete Vendor Change Request
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please confirm before deleting the vendor request. Deleting this
          request means the vendor will not be changed as the user requested.
        </DialogContentText>
        <Box display="flex" flexDirection="column">
          <Typography variant="subtitle2" color="textSecondary">
            Submitted By
          </Typography>
          <Typography variant={"body1"}>{userName}</Typography>
        </Box>
        <Box mb={2} mt={2}>
          <Divider />
        </Box>
        <Box display="flex" flexDirection="column" mb={2}>
          <Typography variant="subtitle2" color="textSecondary">
            Requested Company
          </Typography>
          <Typography variant={"body1"}>{company}</Typography>
        </Box>
        <Box display="flex" flexDirection="column">
          <Typography variant="subtitle2" color="textSecondary">
            Category
          </Typography>
          <Typography variant={"body1"}>
            {
              VendorChangeRequestsCategoryToLabel[
                vendorChangeRequest.category as VendorChangeRequestsCategoryEnum
              ]
            }
          </Typography>
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
