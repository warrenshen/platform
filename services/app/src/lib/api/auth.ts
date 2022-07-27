import { Companies } from "generated/graphql";
import { CustomMutationResponse, authRoutes, authenticatedApi } from "lib/api";
import { getRefreshToken } from "lib/auth/tokenStorage";

export type AuthenticateBlazeUserReq = {
  variables: {
    auth_key: string;
    external_blaze_company_id: string;
    external_blaze_shop_id: string;
    external_blaze_user_id: string;
    external_blaze_user_role: number;
    external_blaze_user_email: string;
    external_blaze_user_first_name: string;
    external_blaze_user_last_name: string;
  };
};

export async function authenticateBlazeUserMutation(
  req: AuthenticateBlazeUserReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(authRoutes.authenticateBlazeUser, req.variables)
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
          msg: "Could not authenticate Blaze user",
        };
      }
    );
}

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
