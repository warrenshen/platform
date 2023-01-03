import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Theme,
  Typography,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import AsyncJobsDataGrid from "components/Settings/AsyncJobsDataGrid";
import { AsyncJobs } from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { deleteAsyncJobMutation } from "lib/api/asyncJobs";

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
  asyncJobs: AsyncJobs[];
  handleClose: () => void;
}

function DeleteAsyncJobModal({ asyncJobs, handleClose }: Props) {
  const snackbar = useSnackbar();
  const classes = useStyles();

  const [deleteAsyncJob, { loading: isDeleteAsyncJobLoading }] =
    useCustomMutation(deleteAsyncJobMutation);

  const asyncJobIds = asyncJobs.map((job) => job.id);

  const handleClickSubmit = async () => {
    const response = await deleteAsyncJob({
      variables: {
        async_job_ids: asyncJobIds,
      },
    });

    if (response.status !== "OK") {
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
          <AsyncJobsDataGrid asyncJobs={asyncJobs} />
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
            Delete
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default DeleteAsyncJobModal;
