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
import { AsyncJobs } from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { deleteAsyncJobMutation } from "lib/api/asyncJobs";
import { formatDatetimeString } from "lib/date";
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
  asyncJob: AsyncJobs;
  handleClose: () => void;
}

function DeleteAsyncJobModal({ asyncJob, handleClose }: Props) {
  const snackbar = useSnackbar();
  const classes = useStyles();
  const [errMsg, setErrMsg] = useState("");

  const [deleteAsyncJob, { loading: isDeleteAsyncJobLoading }] =
    useCustomMutation(deleteAsyncJobMutation);

  const handleClickSubmit = async () => {
    const response = await deleteAsyncJob({
      variables: {
        async_job_id: asyncJob.id,
      },
    });

    if (response.status !== "OK") {
      setErrMsg(response.msg);
      snackbar.showError(`Could not delete job. Error: ${response.msg}`);
    } else {
      snackbar.showSuccess("Async job deleted.");
      handleClose();
    }
  };

  return (
    <Dialog
      open
      onClose={handleClose}
      maxWidth="xl"
      classes={{ paper: classes.dialog }}
    >
      <DialogTitle className={classes.dialogTitle}>Delete Job</DialogTitle>
      <DialogContent>
        <Typography>
          Deleting this job will make remove it from the async jobs queue. A new
          job request will need to be submitted to run this job again. This can
          not be undone.
        </Typography>
        <Box display="flex" flexDirection="column">
          <Box display="flex" flexDirection="column" mt={4}>
            <TextField disabled label="Job Name" value={asyncJob.name} />
          </Box>
          <Box display="flex" flexDirection="column" mt={4}>
            <TextField
              disabled
              label="Submitted By"
              value={asyncJob.submitted_by_user_id}
            />
          </Box>
          <Box display="flex" flexDirection="column" mt={4}>
            <TextField
              disabled
              label="Queued time"
              value={formatDatetimeString(asyncJob.queued_at)}
            />
          </Box>
          {errMsg && <Typography>Error: {errMsg}</Typography>}
        </Box>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Box>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            disabled={isDeleteAsyncJobLoading}
            className={classes.submitButton}
            onClick={handleClickSubmit}
            variant="contained"
            color="secondary"
          >
            Deactivate
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default DeleteAsyncJobModal;
