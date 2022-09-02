import { Box, Typography } from "@material-ui/core";
import Modal from "components/Shared/Modal/Modal";
import { AsyncJobFragment, useGetAsyncJobByIdQuery } from "generated/graphql";
import { AsyncJobNameEnum, AsyncJobNameEnumToLabel } from "lib/enum";

interface Props {
  asyncJobId: AsyncJobFragment["id"];
  handleClose: () => void;
}

function AsyncJobDetailModal({ asyncJobId, handleClose }: Props) {
  const { data } = useGetAsyncJobByIdQuery({
    skip: !asyncJobId,
    fetchPolicy: "network-only",
    variables: {
      id: asyncJobId,
    },
  });

  const asyncJob = data?.async_jobs_by_pk || null;
  const jobPayload = JSON.stringify(
    asyncJob?.job_payload ? asyncJob.job_payload : ""
  );
  const retryPayload = JSON.stringify(
    asyncJob?.retry_payload ? asyncJob.retry_payload : ""
  );

  return (
    <>
      {!!asyncJob && (
        <Modal
          title={"Async Job"}
          subtitle={
            AsyncJobNameEnumToLabel[asyncJob.name as AsyncJobNameEnum] || ""
          }
          contentWidth={1000}
          handleClose={handleClose}
        >
          <Box>
            <Typography variant="subtitle2" color="textSecondary">
              Job Payload
            </Typography>
            <Typography variant="body1">{jobPayload}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="textSecondary">
              Retry Count
            </Typography>
            <Typography variant="body1">{asyncJob.num_retries || 0}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="textSecondary">
              Error Details
            </Typography>
            <Typography variant="body1">
              {asyncJob.err_details || ""}
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="textSecondary">
              Retry Payload
            </Typography>
            <Typography variant="body1">{retryPayload}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="textSecondary">
              Job ID
            </Typography>
            <Typography variant={"body1"}>{asyncJob?.id || ""}</Typography>
          </Box>
        </Modal>
      )}
    </>
  );
}

export default AsyncJobDetailModal;
