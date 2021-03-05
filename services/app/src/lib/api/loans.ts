import { Loans } from "generated/graphql";
import { authenticatedApi, CustomMutationResponse, loansRoutes } from "lib/api";

export type SubmitLoanReq = {
  variables: {
    loan_id: Loans["id"];
  };
};

export async function submitLoanMutation(
  req: SubmitLoanReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(loansRoutes.submitForApproval, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not submit loan",
        };
      }
    );
}
