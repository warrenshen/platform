import {
  Companies,
  CompanyLicenses,
  CompanyLicensesInsertInput,
} from "generated/graphql";
import {
  CustomMutationResponse,
  authenticatedApi,
  licenseRoutes,
} from "lib/api";

export type CreateUpdateCompanyLicenseReq = {
  variables: {
    id: CompanyLicenses["id"];
    company_id: CompanyLicenses["company_id"];
    license_number: CompanyLicenses["license_number"];
    file_id: CompanyLicenses["file_id"];
    facility_row_id: CompanyLicenses["facility_row_id"];
    is_underwriting_enabled: CompanyLicenses["is_underwriting_enabled"];
    us_state: CompanyLicenses["us_state"];
  };
};

export async function createUpdateCompanyLicenseMutation(
  req: CreateUpdateCompanyLicenseReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(licenseRoutes.createUpdateLicense, req.variables)
    .then((res) => {
      return res.data;
    })
    .then(
      (response) => response,
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not save license",
        };
      }
    );
}

export type CreateUpdateLicensesReq = {
  variables: {
    company_id: Companies["id"];
    company_licenses: CompanyLicensesInsertInput[];
  };
};

export async function createUpdateLicensesMutation(
  req: CreateUpdateLicensesReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(licenseRoutes.createUpdateLicenses, req.variables)
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

export async function deleteLicenseMutation(req: {
  variables: {
    license_id: CompanyLicenses["id"];
  };
}): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(licenseRoutes.deleteLicense, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not delete license",
        };
      }
    );
}
