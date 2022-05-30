import {
  Companies,
  UserFragment,
  Users,
  UsersInsertInput,
} from "generated/graphql";
import { CustomMutationResponse, authenticatedApi, userRoutes } from "lib/api";

type CreateBankCustomerUserRequest = {
  variables: {
    company_id: Companies["id"];
    user: UsersInsertInput;
  };
};

export type UpdateUserReq = {
  variables: {
    id: UserFragment["id"];
    role: string | undefined;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    phone_number: string;
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

export async function deactivateCustomerUserMutation(req: {
  variables: {
    user_id: Users["id"];
  };
}): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(userRoutes.deactivateCustomerUser, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not deactivate user",
        };
      }
    );
}

export async function reactivateCustomerUserMutation(req: {
  variables: {
    user_id: Users["id"];
  };
}): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(userRoutes.reactivateCustomerUser, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not re-activate user",
        };
      }
    );
}

export async function updateUser(
  req: UpdateUserReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(userRoutes.updateUser, req)
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
          msg: "Could not update the user",
        };
      }
    );
}
