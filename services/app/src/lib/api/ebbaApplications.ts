import { EbbaApplications } from "generated/graphql";
import {
  CustomMutationResponse,
  authenticatedApi,
  ebbaApplicationsRoutes,
} from "lib/api";

export type SubmitEbbaApplicationReq = {
  variables: {
    ebba_application_id: EbbaApplications["id"];
  };
};

export async function submitEbbaApplicationMutation(
  req: SubmitEbbaApplicationReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(ebbaApplicationsRoutes.submitForApproval, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not submit ebba application",
        };
      }
    );
}

export type DeleteEbbaApplicationReq = {
  variables: {
    ebba_application_id: EbbaApplications["id"];
  };
};

export async function deleteEbbaApplicationMutation(
  req: DeleteEbbaApplicationReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(ebbaApplicationsRoutes.delete, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not delete borrowing base",
        };
      }
    );
}
