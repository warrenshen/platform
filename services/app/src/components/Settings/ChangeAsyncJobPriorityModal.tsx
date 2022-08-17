import { Box, Typography } from "@material-ui/core";
import AsyncJobsDataGrid from "components/Settings/AsyncJobsDataGrid";
import Modal from "components/Shared/Modal/Modal";
import { AsyncJobs } from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { changeAsyncJobPriorityMutation } from "lib/api/asyncJobs";

interface Props {
  asyncJobs: AsyncJobs[];
  handleClose: () => void;
}

function ChangeAsyncJobPriorityModal({ asyncJobs, handleClose }: Props) {
  const snackbar = useSnackbar();

  const [changeAsyncJobPriority, { loading: isChangeAsyncJobPriorityLoading }] =
    useCustomMutation(changeAsyncJobPriorityMutation);

  const priority = asyncJobs[0].is_high_priority || false;
  const beforePriority = !!priority ? "HIGH" : "LOW";
  const afterPriority = !!priority ? "LOW" : "HIGH";
  const asyncJobIds = asyncJobs.map((job) => job.id);

  const handleClickSubmit = async () => {
    const response = await changeAsyncJobPriority({
      variables: {
        async_job_ids: asyncJobIds,
        priority: !priority,
      },
    });

    if (response.status !== "OK") {
      snackbar.showError(
        `Could not change priority on jobs. Error: ${response.msg}`
      );
    } else {
      snackbar.showSuccess("Priorities on async jobs changed.");
      handleClose();
    }
  };

  return (
    <Modal
      title={"Change Async Job Priorities"}
      isPrimaryActionDisabled={isChangeAsyncJobPriorityLoading}
      handleClose={handleClose}
      contentWidth={1000}
      primaryActionText={"Submit"}
      handlePrimaryAction={handleClickSubmit}
    >
      <Box>
        <Typography>
          This request will change the priorities of the following jobs from{" "}
          <strong>{beforePriority}</strong> to <strong>{afterPriority}</strong>.
        </Typography>
        <AsyncJobsDataGrid asyncJobs={asyncJobs} />
      </Box>
    </Modal>
  );
}

export default ChangeAsyncJobPriorityModal;
