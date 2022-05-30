import {
  BankAccountFragment,
  BankAccountsInsertInput,
} from "generated/graphql";
import {
  CustomMutationResponse,
  authenticatedApi,
  bankAccountsRoutes,
} from "lib/api";

export type DeleteBankAccountMutationReq = {
  variables: {
    bank_account_id: BankAccountFragment["id"];
  };
};

export async function deleteBankAccountMutation(
  req: DeleteBankAccountMutationReq
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

export type CreateBankAccountMutationReq = {
  variables: {
    bankAccount: BankAccountsInsertInput;
  };
};

export async function createBankAccountMutation(
  req: CreateBankAccountMutationReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(bankAccountsRoutes.createBankAccount, req.variables)
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
          msg: "Could not create the bank account",
        };
      }
    );
}

export type UpdateBankAccountMutationReq = {
  variables: {
    bankAccountId: BankAccountFragment["id"];
    bankAccount: BankAccountsInsertInput;
  };
};

export async function updateBankAccountMutation(
  req: UpdateBankAccountMutationReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(bankAccountsRoutes.updateBankAccount, req.variables)
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
          msg: "Could not update the bank account",
        };
      }
    );
}
