import { Companies } from "generated/graphql";
import { authenticatedApi, CustomMutationResponse, userRoutes } from "lib/api";

export type CreatePayorVendorRequest = {
  variables: {
    is_payor: boolean;
    company_id: Companies["id"];
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
  };
};

export async function createPayorVendorUserMutation(
  req: CreatePayorVendorRequest
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
