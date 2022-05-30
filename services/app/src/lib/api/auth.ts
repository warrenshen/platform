import { Companies } from "generated/graphql";
import { CustomMutationResponse, authRoutes, authenticatedApi } from "lib/api";
import { getRefreshToken } from "lib/auth/tokenStorage";

export type SwitchLocationReq = {
  variables: {
    company_id: Companies["id"];
  };
};

export async function switchLocationMutation(
  req: SwitchLocationReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(authRoutes.switchLocation, req.variables, {
      headers: {
        Authorization: `Bearer ${getRefreshToken()}`,
      },
    })
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
          msg: "Could not switch location",
        };
      }
    );
}
