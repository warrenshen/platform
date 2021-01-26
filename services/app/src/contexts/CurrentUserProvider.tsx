import { ApolloClient, NormalizedCacheObject } from "@apollo/client";
import * as Sentry from "@sentry/react";
import axios from "axios";
import { CurrentUserContext, User } from "contexts/CurrentUserContext";
import { UserRolesEnum } from "generated/graphql";
import JwtDecode from "jwt-decode";
import { authenticatedApi, authRoutes, unAuthenticatedApi } from "lib/api";
import {
  getAccessToken,
  getRefreshToken,
  removeAccessToken,
  removeRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "lib/auth/tokenStorage";
import { useCallback, useEffect, useState } from "react";

const blankUser = {
  id: "",
  companyId: "",
  role: UserRolesEnum.CompanyAdmin,
};

const JWT_CLAIMS_KEY = "https://hasura.io/jwt/claims";
function userFrom(token: string) {
  const decodedToken: any = JwtDecode(token);
  const claims = decodedToken[JWT_CLAIMS_KEY];
  return {
    id: claims["X-Hasura-User-Id"],
    companyId: claims["X-Hasura-Company-Id"],
    role: claims["X-Hasura-Default-Role"],
  };
}

function CurrentUserWrapper(props: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(blankUser);
  const [isTokenLoaded, setIsTokenLoaded] = useState(false);

  const isSignedIn = !!(user.id && user.role);

  useEffect(() => {
    async function setUserFromAccessToken() {
      const accessToken = await getAccessToken();
      if (accessToken) {
        setUser(userFrom(accessToken));
      }
      setIsTokenLoaded(true);
    }
    if (isTokenLoaded === false) {
      setUserFromAccessToken();
    }
  }, [isTokenLoaded]);

  const resetUser = useCallback(() => setIsTokenLoaded(false), []);

  const signIn = useCallback(async (email: string, password: string) => {
    const response = await unAuthenticatedApi.post(authRoutes.signIn, {
      email,
      password,
    });

    try {
      const data = response.data;
      if (data.status === "OK" && data.access_token) {
        setAccessToken(data.access_token);
        setRefreshToken(data.refresh_token);
        setUser(userFrom(data.access_token));
      } else {
        setUser(blankUser);
      }
    } catch (err) {
      setUser(blankUser);
    }
  }, []);

  const signOut = useCallback(
    async (client: ApolloClient<NormalizedCacheObject>) => {
      try {
        const refreshToken = getRefreshToken();
        await axios.all([
          authenticatedApi.post(authRoutes.revokeAccessToken),
          unAuthenticatedApi.post(
            authRoutes.revokeRefreshToken,
            {},
            {
              headers: {
                Authorization: `Bearer ${refreshToken}`,
              },
            }
          ),
        ]);
      } catch (e) {
        Sentry.captureException(e);
      } finally {
        removeAccessToken();
        removeRefreshToken();
        client.clearStore();
        setUser(blankUser);
      }
    },
    []
  );

  return isTokenLoaded ? (
    <CurrentUserContext.Provider
      value={{
        user,
        isSignedIn,
        resetUser,
        signIn,
        signOut,
      }}
    >
      {props.children}
    </CurrentUserContext.Provider>
  ) : (
    <></>
  );
}

export default CurrentUserWrapper;
