import { ApolloClient, NormalizedCacheObject } from "@apollo/client";
import * as Sentry from "@sentry/react";
import {
  CurrentUserContext,
  User,
  UserRole,
} from "contexts/CurrentUserContext";
import useTokenStorage from "hooks/useTokenStorage";
import JwtDecode from "jwt-decode";
import { useCallback, useEffect, useState } from "react";
import { authEndpoints } from "routes";

const blankUser = {
  id: "",
  companyId: "",
  role: UserRole.CompanyAdmin,
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
  const {
    getAccessToken,
    getRefreshToken,
    setAccessToken,
    setRefreshToken,
    removeAccessToken,
    removeRefreshToken,
  } = useTokenStorage();

  const [user, setUser] = useState<User>(blankUser);
  const [loadedToken, setLoadedToken] = useState(false);

  useEffect(() => {
    async function updateUser() {
      const accessToken = await getAccessToken();
      if (accessToken) {
        setUser(userFrom(accessToken));
      }
      setLoadedToken(true);
    }
    updateUser();
  }, [getAccessToken]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const response = await fetch(authEndpoints.signIn, {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      try {
        const data = await response.json();
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
    },
    [setAccessToken, setRefreshToken]
  );

  const signOut = useCallback(
    async (client: ApolloClient<NormalizedCacheObject>) => {
      try {
        const accessToken = await getAccessToken();
        await fetch(authEndpoints.revokeAccessToken, {
          method: "POST",
          mode: "cors",
          cache: "no-cache",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const refreshToken = await getRefreshToken();
        await fetch(authEndpoints.revokeRefreshToken, {
          method: "POST",
          mode: "cors",
          cache: "no-cache",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${refreshToken}`,
          },
        });
      } catch (e) {
        Sentry.captureException(e);
      } finally {
        removeAccessToken();
        removeRefreshToken();
        client.clearStore();
        setUser(blankUser);
      }
    },
    [getAccessToken, getRefreshToken, removeAccessToken, removeRefreshToken]
  );

  return loadedToken ? (
    <CurrentUserContext.Provider
      value={{
        user,
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
