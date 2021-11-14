import { ApolloClient, NormalizedCacheObject } from "@apollo/client";
import * as Sentry from "@sentry/react";
import axios from "axios";
import {
  BlankUser,
  CurrentUserContext,
  User,
} from "contexts/CurrentUserContext";
import JwtDecode from "jwt-decode";
import { authenticatedApi, authRoutes, unAuthenticatedApi } from "lib/api";
import { ProductTypeEnum } from "lib/enum";
import {
  getAccessToken,
  getRefreshToken,
  removeAccessToken,
  removeRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "lib/auth/tokenStorage";
import { routes } from "lib/routes";
import { ReactNode, useCallback, useEffect, useState } from "react";

const JWT_CLAIMS_KEY = "https://hasura.io/jwt/claims";
function userFieldsFromToken(token: string) {
  const decodedToken: any = JwtDecode(token);
  const claims = decodedToken[JWT_CLAIMS_KEY];

  // "X-Hasura-User-Id" equals "" for anonymous users.
  // "X-Hasura-Company-Id" equals "" or "None" for bank users.
  return {
    id: claims["X-Hasura-User-Id"] || null,
    companyId:
      claims["X-Hasura-Company-Id"] !== "" &&
      claims["X-Hasura-Company-Id"] !== "None"
        ? claims["X-Hasura-Company-Id"]
        : null,
    role: claims["X-Hasura-Default-Role"],
  };
}

export default function CurrentUserProvider(props: { children: ReactNode }) {
  const [user, setUser] = useState<User>(BlankUser);
  const [isTokenLoaded, setIsTokenLoaded] = useState(false);
  const isSignedIn = !!(user.id && user.role);

  useEffect(() => {
    async function setUserFromAccessToken() {
      const accessToken = await getAccessToken();
      if (accessToken) {
        setUser((user) => ({
          ...user,
          ...userFieldsFromToken(accessToken),
        }));
      }
      setIsTokenLoaded(true);
    }
    if (isTokenLoaded === false) {
      setUserFromAccessToken();
    }
  }, [isTokenLoaded]);

  const resetUser = useCallback(() => setIsTokenLoaded(false), []);
  const setUserProductType = useCallback(
    (productType: ProductTypeEnum) => {
      if (user.productType !== productType) {
        setUser((user) => ({ ...user, productType }));
      }
    },
    [user.productType]
  );

  const signIn = useCallback(
    async (
      email: string,
      password: string,
      handleSuccess: (successUrl: string) => void
    ) => {
      const response = await unAuthenticatedApi.post(authRoutes.signIn, {
        email,
        password,
      });

      // Try catch block to catch errors related to `userFieldsFromToken`.
      try {
        const data = response.data;
        if (
          data.login_method === "simple" &&
          data.status === "OK" &&
          data.access_token
        ) {
          setAccessToken(data.access_token);
          setRefreshToken(data.refresh_token);
          setUser((user) => ({
            ...user,
            ...userFieldsFromToken(data.access_token),
          }));
          handleSuccess(routes.root);
        } else if (data.login_method === "2fa" && data.status === "OK") {
          handleSuccess(data.two_factor_link);
        } else {
          alert(data.msg);
        }
      } catch (err) {
        alert(err);
      }
    },
    []
  );

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
        setUser(BlankUser);
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
        setUserProductType,
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
