import { Companies, Files } from "generated/graphql";
import {
  authenticatedApi,
  CustomMutationResponse,
  licenseRoutes,
} from "lib/api";

export type UpdateLicensesReq = {
  variables: {
    company_id: Companies["id"];
    file_ids: Array<Files["id"]>;
  };
};

export async function updateLicensesMutation(
  req: UpdateLicensesReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(licenseRoutes.updateLicenses, req.variables)
    .then((res) => {
      return res.data;
    })
    .then(
      (response) => response,
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not update licenses",
        };
      }
    );
}
