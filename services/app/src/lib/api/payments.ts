import { Payments } from "generated/graphql";
import { authenticatedApi, CustomMutationResponse, loansRoutes } from "lib/api";

export type DeleteRepaymentReq = {
  variables: {
    payment_id: Payments["id"];
  };
};

export async function deleteRepaymentMutation(
  req: DeleteRepaymentReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(loansRoutes.deleteRepayment, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not delete payment",
        };
      }
    );
}
