import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Theme,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import Text, { TextVariants } from "components/Shared/Text/Text";
import { MetrcApiKeys } from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { refreshMetrcApiKeyPermissionsMutation } from "lib/api/metrc";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialog: {
      width: 500,
    },
    dialogActions: {
      margin: theme.spacing(2),
    },
  })
);

interface Props {
  metrcApiKeyId: MetrcApiKeys["id"];
  handleClose: () => void;
}

export default function UpsertMetrcKeyModal({
  metrcApiKeyId,
  handleClose,
}: Props) {
  const classes = useStyles();
  const snackbar = useSnackbar();

  const [
    refreshMetrcApiKeyPermissions,
    { loading: isRefreshMetrcApiKeyPermissionsLoading },
  ] = useCustomMutation(refreshMetrcApiKeyPermissionsMutation);

  const handleClickSubmit = async () => {
    const response = await refreshMetrcApiKeyPermissions({
      variables: {
        metrc_api_key_id: metrcApiKeyId,
      },
    });

    if (response.status !== "OK") {
      snackbar.showError(
        `Could not refresh Metrc API key permissions. Reason: ${response.msg}`
      );
    } else {
      snackbar.showSuccess("Metrc API key permissions refreshed successfully");
      handleClose();
    }
  };

  return (
    <Dialog
      open
      onClose={handleClose}
      maxWidth="md"
      classes={{ paper: classes.dialog }}
    >
      <DialogTitle>{"Refresh Metrc API Key Permissions"}</DialogTitle>
      <DialogContent>
        {isRefreshMetrcApiKeyPermissionsLoading ? (
          <Box display="flex" justifyContent="center" mt={2}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            <Text textVariant={TextVariants.Label}>
              Press Submit to trigger the system to check if this Metrc API key
              is working. If it is, this will also trigger the system to
              download data for the licenses the Metrc API key has permissions
              to.
            </Text>
          </Box>
        )}
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Box display="flex">
          <Box mr={2}>
            <Button onClick={handleClose}>Cancel</Button>
          </Box>
          <Button
            disabled={isRefreshMetrcApiKeyPermissionsLoading}
            variant="contained"
            color="primary"
            onClick={handleClickSubmit}
          >
            Submit
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
