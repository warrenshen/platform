import { Loans, Payments, PaymentsInsertInput } from "generated/graphql";
import { authenticatedApi, CustomMutationResponse, loansRoutes } from "lib/api";

export type CreateAdvanceReq = {
  variables: {
    payment: PaymentsInsertInput;
    loan_ids: Loans["id"][];
    should_charge_wire_fee: boolean;
  };
};

export async function createAdvanceMutation(
  req: CreateAdvanceReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(loansRoutes.createAdvance, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not create advance",
        };
      }
    );
}

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
