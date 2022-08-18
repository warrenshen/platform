import { AsyncJobs } from "generated/graphql";
import {
  CustomMutationResponse,
  asyncJobRoutes,
  authenticatedApi,
} from "lib/api";

export type DeleteAsyncJobReq = {
  variables: {
    async_job_id: AsyncJobs["id"];
  };
};

export async function deleteAsyncJobMutation(
  req: DeleteAsyncJobReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(asyncJobRoutes.deleteAsyncJob, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.error(error);
        return {
          status: "ERROR",
          msg: "Could not delete async job",
        };
      }
    );
}

export type ChangeAsyncJobPriorityReq = {
  variables: {
    async_job_ids: AsyncJobs["id"][];
    priority: boolean;
  };
};

export async function changeAsyncJobPriorityMutation(
  req: ChangeAsyncJobPriorityReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(asyncJobRoutes.changeAsyncJobPriority, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.error(error);
        return {
          status: "ERROR",
          msg: "Could not change async jobs priority",
        };
      }
    );
}

export type RetryAsyncJobReq = {
  variables: {
    async_job_ids: AsyncJobs["id"][];
  };
};

export async function retryAsyncJobMutation(
  req: RetryAsyncJobReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(asyncJobRoutes.retryAsyncJob, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.error(error);
        return {
          status: "ERROR",
          msg: "Could not retry async jobs",
        };
      }
    );
}
