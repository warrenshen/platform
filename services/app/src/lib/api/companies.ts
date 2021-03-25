import {
  Companies,
  CompaniesInsertInput,
  CompanySettingsInsertInput,
  ContractsInsertInput,
  UsersInsertInput,
} from "generated/graphql";
import {
  authenticatedApi,
  companyRoutes,
  CustomMutationResponse,
} from "lib/api";

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

type CreatePayorVendorMutationReq = {
  variables: {
    is_payor: boolean;
    customer_id: Companies["id"];
    company: CompaniesInsertInput;
    user: UsersInsertInput;
  };
};

export async function createPayorVendorMutation(
  req: CreatePayorVendorMutationReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(companyRoutes.createPayorVendor, req.variables)
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
          msg: "Could not create partner company",
        };
      }
    );
}
