import { BankAccountFragment } from "generated/graphql";
import {
  authenticatedApi,
  bankAccountsRoutes,
  CustomMutationResponse,
} from "lib/api";

export type DeleteBankAccountReq = {
  variables: {
    bank_account_id: BankAccountFragment["id"];
  };
};

export async function deleteBankAccount(
  req: DeleteBankAccountReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(bankAccountsRoutes.deleteBankAccount, req)
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
          msg: "Could not delete the bank account",
        };
      }
    );
}
