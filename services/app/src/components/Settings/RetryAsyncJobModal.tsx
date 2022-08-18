import { Box, Typography } from "@material-ui/core";
import AsyncJobsDataGrid from "components/Settings/AsyncJobsDataGrid";
import Modal from "components/Shared/Modal/Modal";
import { AsyncJobs } from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { retryAsyncJobMutation } from "lib/api/asyncJobs";

interface Props {
  asyncJobs: AsyncJobs[];
  handleClose: () => void;
}

function RetryAsyncJobModal({ asyncJobs, handleClose }: Props) {
  const snackbar = useSnackbar();

  const [retryAsyncJob, { loading: isRetryAsyncJobLoading }] =
    useCustomMutation(retryAsyncJobMutation);

  const asyncJobIds = asyncJobs.map((job) => job.id);

  const handleClickSubmit = async () => {
    const response = await retryAsyncJob({
      variables: {
        async_job_ids: asyncJobIds,
      },
    });

    if (response.status !== "OK") {
      snackbar.showError(`Could not retry jobs. Error: ${response.msg}`);
    } else {
      snackbar.showSuccess("Async jobs retried.");
      handleClose();
    }
  };

  return (
    <Modal
      title={"Change Async Job Priorities"}
      isPrimaryActionDisabled={isRetryAsyncJobLoading}
      handleClose={handleClose}
      contentWidth={1000}
      primaryActionText={"Submit"}
      handlePrimaryAction={handleClickSubmit}
    >
      <Box>
        <Typography>
          This request will retry the following job(s) and add it to the end of
          the queue.
        </Typography>
        <AsyncJobsDataGrid asyncJobs={asyncJobs} isRetryPayloadVisible={true} />
      </Box>
    </Modal>
  );
}

export default RetryAsyncJobModal;
