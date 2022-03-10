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
    parentCompanyId:
      claims["X-Hasura-Parent-Company-Id"] !== "" &&
      claims["X-Hasura-Parent-Company-Id"] !== "None"
        ? claims["X-Hasura-Parent-Company-Id"]
        : null,
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

  const signOut = useCallback(async () => {
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
      // Note: the following line forces a hard refresh, which does two things:
      // 1. Resets the state of the App so the user is not signed in.
      // 2. Guarantees that the user gets the latest version of the App.
      window.location.href = routes.signIn;
    }
  }, []);

  useEffect(() => {
    async function setUserFromAccessToken() {
      const accessToken = await getAccessToken();
      if (accessToken) {
        const userFields = userFieldsFromToken(accessToken);
        // If JWT companyId is set but parentCompanyId is not, JWT is invalid (deprecated format).
        // Force sign out the user in this case to get a valid JWT on next sign in.
        if (!!userFields.companyId && !userFields.parentCompanyId) {
          signOut();
        } else {
          setUser((user) => ({
            ...user,
            ...userFieldsFromToken(accessToken),
          }));
        }
      }
      setIsTokenLoaded(true);
    }
    if (isTokenLoaded === false) {
      setUserFromAccessToken();
    }
  }, [isTokenLoaded, signOut]);

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
