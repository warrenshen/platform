// This file is for library code to handle logic (mostly handled by the backend)
// when it comes to creating a customer

import {
  CompaniesInsertInput,
  CompanySettingsInsertInput,
  ContractsInsertInput,
} from "generated/graphql";
import { authenticatedApi, companyRoutes } from "lib/api";

export type CreateCompanyReq = {
  company: CompaniesInsertInput;
  settings: CompanySettingsInsertInput;
  contract: ContractsInsertInput;
};

export type CreateCompanyResp = {
  status: string;
  msg: string;
};

export async function createCompany(
  req: CreateCompanyReq
): Promise<CreateCompanyResp> {
  return authenticatedApi
    .post(companyRoutes.createCompany, req)
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
          msg: "Could not create company",
        };
      }
    );
}
