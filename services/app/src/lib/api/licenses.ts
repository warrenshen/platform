import {
  Companies,
  CompanyLicenses,
  CompanyLicensesInsertInput,
  Files,
} from "generated/graphql";
import {
  authenticatedApi,
  CustomMutationResponse,
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

export type DeleteLicenseReq = {
  variables: {
    company_id: Companies["id"];
    file_id: Files["id"];
  };
};

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