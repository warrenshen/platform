import { Companies, Contracts, ContractsInsertInput } from "generated/graphql";
import {
  CustomMutationResponse,
  authenticatedApi,
  contractRoutes,
} from "lib/api";

export type AddContractReq = {
  variables: {
    company_id: Companies["id"];
    contract_fields: ContractsInsertInput;
  };
};

export async function addContractMutation(
  req: AddContractReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(contractRoutes.addContract, req.variables)
    .then((res) => {
      return res.data;
    })
    .then(
      (response) => {
        return response;
      },
      (error) => {
        console.error({ error });
        return {
          status: "ERROR",
          msg: "Could not add contract",
        };
      }
    );
}

export type UpdateContractReq = {
  variables: {
    contract_id: Contracts["id"];
    contract_fields: ContractsInsertInput;
  };
};

export async function updateContractMutation(
  req: UpdateContractReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(contractRoutes.updateContract, req.variables)
    .then((res) => {
      return res.data;
    })
    .then(
      (response) => {
        return response;
      },
      (error) => {
        console.error({ error });
        return {
          status: "ERROR",
          msg: "Could not update contract",
        };
      }
    );
}

export type TerminateContractReq = {
  variables: {
    contract_id: Contracts["id"];
    termination_date: Contracts["adjusted_end_date"];
  };
};

export async function terminateContractMutation(
  req: TerminateContractReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(contractRoutes.terminateContract, req.variables)
    .then((res) => {
      return res.data;
    })
    .then(
      (response) => {
        return response;
      },
      (error) => {
        console.error({ error });
        return {
          status: "ERROR",
          msg: "Could not terminate contract",
        };
      }
    );
}

export type DeleteContractReq = {
  variables: {
    contract_id: Contracts["id"];
  };
};

export async function deleteContractMutation(
  req: DeleteContractReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(contractRoutes.deleteContract, req.variables)
    .then((res) => {
      return res.data;
    })
    .then(
      (response) => {
        return response;
      },
      (error) => {
        console.error({ error });
        return {
          status: "ERROR",
          msg: "Could not delete contract",
        };
      }
    );
}
