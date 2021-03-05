import { EbbaApplications } from "generated/graphql";
import {
  authenticatedApi,
  CustomMutationResponse,
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
