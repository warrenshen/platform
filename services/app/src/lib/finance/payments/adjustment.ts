import { Companies, Loans } from "generated/graphql";
import { CustomMutationResponse, authenticatedApi, loansRoutes } from "lib/api";

export type CreateAdjustmentReq = {
  variables: {
    company_id: Companies["id"];
    loan_id: Loans["id"];
    to_principal: number;
    to_interest: number;
    to_fees: number;
    payment_date: string;
    settlement_date: string;
  };
};

export async function createAdjustmentMutation(
  req: CreateAdjustmentReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(loansRoutes.createAdjustment, req.variables)
    .then((res) => {
      return res.data;
    })
    .then(
      (response) => response,
      (error) => {
        console.error({ error });
        return {
          status: "ERROR",
          msg: "Could not make adjustment",
        };
      }
    );
}
