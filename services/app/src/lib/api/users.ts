import { Companies, UsersInsertInput } from "generated/graphql";
import { authenticatedApi, CustomMutationResponse, userRoutes } from "lib/api";

type CreateBankCustomerUserRequest = {
  variables: {
    company_id: Companies["id"];
    user: UsersInsertInput;
  };
};

export async function createBankCustomerUserMutation(
  req: CreateBankCustomerUserRequest
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(userRoutes.createBankCustomerUser, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not create user",
        };
      }
    );
}

type CreatePayorVendorUserRequest = {
  variables: {
    is_payor: boolean;
    company_id: Companies["id"];
    user: UsersInsertInput;
  };
};

export async function createPayorVendorUserMutation(
  req: CreatePayorVendorUserRequest
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(userRoutes.createPayorVendorUser, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not create user",
        };
      }
    );
}
