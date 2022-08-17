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
