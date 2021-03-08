// This file is for library code to handle logic (mostly handled by the backend)
// when it comes to creating a customer

import {
  CompaniesInsertInput,
  CompanySettingsInsertInput,
  ContractsInsertInput,
} from "generated/graphql";
import { authenticatedApi, companyRoutes } from "lib/api";

export type CreateCustomerReq = {
  company: CompaniesInsertInput;
  settings: CompanySettingsInsertInput;
  contract: ContractsInsertInput;
};

export type CreateCustomerResp = {
  status: string;
  msg: string;
};

export async function createCustomer(
  req: CreateCustomerReq
): Promise<CreateCustomerResp> {
  return authenticatedApi
    .post(companyRoutes.createCustomer, req)
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
