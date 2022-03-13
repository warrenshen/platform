import { Companies, CompanyFacilities } from "generated/graphql";
import {
  authenticatedApi,
  companyFacilitiesRoutes,
  CustomMutationResponse,
} from "lib/api";

export type CreateUpdateCompanyFacilityReq = {
  variables: {
    id: CompanyFacilities["id"];
    company_id: Companies["id"];
    name: string;
    address: string;
  };
};

export async function createUpdateCompanyFacilityMutation(
  req: CreateUpdateCompanyFacilityReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(companyFacilitiesRoutes.createUpdateCompanyFacility, req.variables)
    .then((res) => {
      return res.data;
    })
    .then(
      (response) => {
        return response;
      },
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not save the company facility",
        };
      }
    );
}

export type DeleteCompanyFacilityReq = {
  variables: {
    company_facility_id: CompanyFacilities["id"];
  };
};

export async function deleteCompanyFacilityMutation(
  req: DeleteCompanyFacilityReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(companyFacilitiesRoutes.deleteCompanyFacility, req.variables)
    .then((res) => {
      return res.data;
    })
    .then(
      (response) => {
        return response;
      },
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not delete the company facility",
        };
      }
    );
}
