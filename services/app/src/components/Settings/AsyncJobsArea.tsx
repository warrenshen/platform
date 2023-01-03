import { Box, Tab, Tabs, Typography } from "@material-ui/core";
import AsyncJobsDataGrid from "components/Settings/AsyncJobsDataGrid";
import ChangeAsyncJobPriorityModal from "components/Settings/ChangeAsyncJobPriorityModal";
import DeleteAsyncJobModal from "components/Settings/DeleteAsyncJobModal";
import RetryAsyncJobModal from "components/Settings/RetryAsyncJobModal";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import {
  AsyncJobs,
  useGetCompletedAsyncJobsQuery,
  useGetOpenAsyncJobsSubscription,
} from "generated/graphql";
import { Action } from "lib/auth/rbac-rules";
import { AsyncJobStatusEnum } from "lib/enum";
import { useMemo, useState } from "react";

function OpenAsyncJobsTab() {
  const { data } = useGetOpenAsyncJobsSubscription({});

  const asyncJobs = data?.async_jobs || [];

  const [selectedAsyncJobs, setSelectedAsyncJobs] = useState<AsyncJobs[]>([]);

  const handleSelectAsyncJobs = useMemo(
    () => (asyncJobs: AsyncJobs[]) => {
      setSelectedAsyncJobs(asyncJobs);
    },
    [setSelectedAsyncJobs]
  );

  const selectJobPriority = selectedAsyncJobs.map(
    (job) => job.is_high_priority
  );

  const allSameJobPriority = selectJobPriority.every(
    (priority) => priority === selectJobPriority[0]
  );

  const allSameStatus = selectedAsyncJobs.every(
    (job) => job.status === AsyncJobStatusEnum.Failed
  );

  const allNotInProgress = selectedAsyncJobs.every(
    (job) => job.status !== AsyncJobStatusEnum.InProgress
  );

  const isDeleteDisabled = selectedAsyncJobs.length < 1 || !allNotInProgress;

  const isRetryAsyncDisabled = selectedAsyncJobs.length < 1 || !allSameStatus;

  const isChangeJobPriorityDisabled =
    selectedAsyncJobs.length < 1 || !allSameJobPriority;

  return (
    <>
      <Box display="flex" flexDirection="row-reverse">
        <Box>
          <Can perform={Action.ChangeAsyncJobPriority}>
            <ModalButton
              isDisabled={isChangeJobPriorityDisabled}
              label={"Change Priority"}
              modal={({ handleClose }) => (
                <ChangeAsyncJobPriorityModal
                  asyncJobs={selectedAsyncJobs}
                  handleClose={() => {
                    handleClose();
                  }}
                />
              )}
            />
          </Can>
        </Box>
        <Box>
          <Can perform={Action.RetryAsyncJob}>
            <Box mr={2}>
              <ModalButton
                isDisabled={isRetryAsyncDisabled}
                label={"Retry"}
                modal={({ handleClose }) => (
                  <RetryAsyncJobModal
                    asyncJobs={selectedAsyncJobs}
                    handleClose={() => {
                      handleClose();
                    }}
                  />
                )}
              />
            </Box>
          </Can>
        </Box>
        <Box>
          <Can perform={Action.DeleteAsyncJob}>
            <Box mr={2}>
              <ModalButton
                isDisabled={isDeleteDisabled}
                label={"Delete Job"}
                modal={({ handleClose }) => (
                  <DeleteAsyncJobModal
                    asyncJobs={selectedAsyncJobs}
                    handleClose={() => {
                      handleClose();
                    }}
                  />
                )}
              />
            </Box>
          </Can>
        </Box>
      </Box>
      <Box display="flex" mt={3}>
        {asyncJobs.length > 0 ? (
          <AsyncJobsDataGrid
            isMultiSelectEnabled
            asyncJobs={asyncJobs}
            handleSelectAsyncJobs={handleSelectAsyncJobs}
          />
        ) : (
          <Typography variant="body2">No jobs set up yet</Typography>
        )}
      </Box>
    </>
  );
}

function CompletedAsyncJobsTab() {
  const { data } = useGetCompletedAsyncJobsQuery({});

  const asyncJobs = data?.async_jobs || [];

  return (
    <>
      <Box display="flex" mt={3}>
        {asyncJobs.length > 0 ? (
          <AsyncJobsDataGrid
            isCompletedJob={true}
            isMultiSelectEnabled={false}
            asyncJobs={asyncJobs}
          />
        ) : (
          <Typography variant="body2">No completed jobs to show</Typography>
        )}
      </Box>
    </>
  );
}

export default function AsyncJobsArea() {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  return (
    <Box>
      <Typography>Async Jobs</Typography>
      <Tabs
        value={selectedTabIndex}
        indicatorColor="primary"
        textColor="primary"
        onChange={(_event: any, value: number) => setSelectedTabIndex(value)}
      >
        <Tab label="Active Async Jobs" />
        <Tab label="Completed Async Jobs" />
      </Tabs>
      <Box mb={2}>
        {selectedTabIndex === 0 ? (
          <OpenAsyncJobsTab />
        ) : (
          <CompletedAsyncJobsTab />
        )}
      </Box>
    </Box>
  );
}
