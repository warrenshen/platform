import { Contracts } from "generated/graphql";
import { authenticatedApi, contractRoutes } from "lib/api";

export type TerminateContractReq = {
  contract_id: Contracts["id"];
  termination_date: Contracts["adjusted_end_date"];
};

export type TerminateContractResp = {
  status: string;
  msg: string;
};

export async function terminateContract(
  req: TerminateContractReq
): Promise<TerminateContractResp> {
  return authenticatedApi
    .post(contractRoutes.terminateContract, req)
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
          msg: "Could not create company",
        };
      }
    );
}
