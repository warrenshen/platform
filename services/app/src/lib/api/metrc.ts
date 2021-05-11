import { authenticatedApi, CustomMutationResponse, metrcRoutes } from "lib/api";

type GetTransfersReq = {
  variables: {
    license_id: string;
    start_date: string;
    end_date: string;
  };
};

export async function getTransfersMutation(
  req: GetTransfersReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(metrcRoutes.getTransfers, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not get transfers",
        };
      }
    );
}
