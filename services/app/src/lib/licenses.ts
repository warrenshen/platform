import { Companies, Files } from "generated/graphql";
import {
  authenticatedApi,
  CustomMutationResponse,
  licenseRoutes,
} from "lib/api";

export type AddLicensesReq = {
  variables: {
    company_id: Companies["id"];
    file_ids: Array<Files["id"]>;
  };
};

export type DeleteLicenseReq = {
  variables: {
    company_id: Companies["id"];
    file_id: Files["id"];
  };
};

export async function addLicensesMutation(
  req: AddLicensesReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(licenseRoutes.addLicenses, req.variables)
    .then((res) => {
      return res.data;
    })
    .then(
      (response) => response,
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not add licenses",
        };
      }
    );
}

export async function deleteLicenseMutation(
  req: DeleteLicenseReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(licenseRoutes.deleteLicense, req.variables)
    .then((res) => {
      return res.data;
    })
    .then(
      (response) => response,
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not delete license",
        };
      }
    );
}
