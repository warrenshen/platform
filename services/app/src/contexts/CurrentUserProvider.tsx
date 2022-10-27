import { ThemeProvider, createTheme } from "@material-ui/core/styles";
import * as Sentry from "@sentry/react";
import axios from "axios";
import BlazePreapprovalPage from "components/Blaze/BlazePreapprovalPage";
import {
  BlankUser,
  CurrentUserContext,
  User,
  isRoleBankUser,
} from "contexts/CurrentUserContext";
import { BlazePreapprovalFragment } from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import JwtDecode from "jwt-decode";
import { authRoutes, authenticatedApi, unAuthenticatedApi } from "lib/api";
import { authenticateBlazeUserMutation } from "lib/api/auth";
import {
  getAccessToken,
  getRefreshToken,
  removeAccessToken,
  removeRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "lib/auth/tokenStorage";
import { ProductTypeEnum } from "lib/enum";
import { routes } from "lib/routes";
import { validUUIDOrDefault } from "lib/uuid";
import { ReactNode, useCallback, useEffect, useState } from "react";

const JWTClaimsKey = "https://hasura.io/jwt/claims";
const ValidBlazeOrigin = process.env.REACT_APP_BESPOKE_BLAZE_PARENT_ORIGIN;

const BespokePrimaryMain = "#769362";
const BlazePrimaryMain = "#2cb2dc";

const BespokePrimaryLight = "#dae6d3";
const BlazePrimaryLight = "#e3f2fd";

const BespokeContrastText = "#ffffff";
const BlazeContrastText = "#ffffff";

const BespokeTypographyFontFamily = ["Inter", "sans-serif"];
const BlazeTypographyFontFamily = ["Roboto", "sans-serif"];

// Global boolean to track if "message" event listener is already added.
// This is necessary since useEffect with an empty dependency array calls
// its callback twice in development environment in strict mode.
let IsEventListenerAdded = false;
type BlazeAuthPayload = {
  auth_key: string;
  company_id: string;
  shop_id: string;
  user_id: string;
  user_role: number;
  user_email: string;
  user_first_name: string;
  user_last_name: string;
};

enum BlazeAuthStatus {
  ApplicantDenied = "applicant_denied",
  ApplicantPreapproved = "applicant_preapproved",
  BorrowerActive = "borrower_active",
}

function userFieldsFromToken(token: string) {
  const decodedToken: any = JwtDecode(token);
  const claims = decodedToken[JWTClaimsKey];

  // "X-Hasura-User-Id" equals "" for anonymous users.
  // "X-Hasura-Company-Id" equals "" or "None" for bank users.
  return {
    id: validUUIDOrDefault(claims["X-Hasura-User-Id"]),
    parentCompanyId: validUUIDOrDefault(claims["X-Hasura-Parent-Company-Id"]),
    companyId: validUUIDOrDefault(claims["X-Hasura-Company-Id"]),
    role: claims["X-Hasura-Default-Role"],
    impersonatorUserId: validUUIDOrDefault(
      claims["X-Hasura-Impersonator-User-Id"]
    ),
  };
}

export default function CurrentUserProvider(props: { children: ReactNode }) {
  // Whether auth token is loading (if true, do not show UI to viewer).
  const [isTokenLoading, setIsTokenLoading] = useState(true);

  const [user, setUser] = useState<User>(BlankUser);
  const isSignedIn = !!(user.id && user.role);

  const [blazeAuthStatus, setBlazeAuthStatus] =
    useState<BlazeAuthStatus | null>(null);
  const [blazePreapproval, setBlazePreapproval] =
    useState<BlazePreapprovalFragment | null>(null);
  const [authenticateBlazeUser, { loading: isAuthenticateBlazeUserLoading }] =
    useCustomMutation(authenticateBlazeUserMutation);

  const resetUser = useCallback(() => setIsTokenLoading(true), []);
  const setUserProductType = useCallback(
    (productType: ProductTypeEnum) => {
      if (user.productType !== productType) {
        setUser((user) => ({ ...user, productType }));
      }
    },
    [user.productType]
  );
  const setUserIsActiveContract = useCallback(
    (isActiveContract: boolean) => {
      if (user.isActiveContract !== isActiveContract) {
        setUser((user) => ({ ...user, isActiveContract }));
      }
    },
    [user.isActiveContract]
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

  const setUserFromAccessToken = useCallback(
    (accessToken: string, refreshToken: string) => {
      if (accessToken && refreshToken) {
        const userFields = userFieldsFromToken(accessToken);
        // If JWT companyId is set but parentCompanyId is not, JWT is invalid (deprecated format).
        // Force sign out the user in this case to get a valid JWT on next sign in.
        if (!!userFields.companyId && !userFields.parentCompanyId) {
          signOut();
        } else {
          setAccessToken(accessToken);
          setRefreshToken(refreshToken);
          setUser((user) => ({
            ...user,
            ...userFieldsFromToken(accessToken),
          }));
        }
      }
      setIsTokenLoading(false);
    },
    [signOut]
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

      // Try catch block to catch errors related to `setUserFromAccessToken`.
      try {
        const data = response.data;
        if (
          data.login_method === "simple" &&
          data.status === "OK" &&
          !!data.access_token &&
          !!data.refresh_token
        ) {
          setUserFromAccessToken(data.access_token, data.refresh_token);
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
    [setUserFromAccessToken]
  );

  const impersonateUser = async (userId: User["id"]) => {
    if (!isRoleBankUser(user?.role)) {
      return "Access Denied";
    }

    const token = await getAccessToken();

    const response = await authenticatedApi.post(
      authRoutes.impersonateUser,
      {
        impersonated_user_id: userId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.data?.status === "ERROR") {
      return response.data.msg;
    } else {
      setUserFromAccessToken(
        response.data.access_token,
        response.data.refresh_token
      );
    }
  };

  const undoImpersonation = async (): Promise<string | void> => {
    const token = await getAccessToken();

    const response = await authenticatedApi.post(
      authRoutes.undoImpersonation,
      {
        impersonator_user_id: user.impersonatorUserId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data?.status === "ERROR") {
      return response.data.msg;
    }
    setUserFromAccessToken(
      response.data.access_token,
      response.data.refresh_token
    );
  };

  useEffect(() => {
    if (isTokenLoading) {
      async function callGetAccessToken() {
        const accessToken = await getAccessToken();
        const refreshToken = await getRefreshToken();
        if (!!accessToken && !!refreshToken) {
          setUserFromAccessToken(accessToken, refreshToken);
        } else {
          setIsTokenLoading(false);
        }
      }
      callGetAccessToken();
    }
  }, [isTokenLoading, signOut, setUserFromAccessToken]);

  useEffect(() => {
    if (IsEventListenerAdded) {
      return;
    } else {
      IsEventListenerAdded = true;
    }

    // If true, app is open in an iframe element.
    const isEmbeddedModule = window.location !== window.parent.location;
    setUser((user) => ({
      ...user,
      isEmbeddedModule,
    }));

    if (isEmbeddedModule) {
      window.addEventListener(
        "message",
        async (event) => {
          // Verify sender of message.
          if (event.origin !== ValidBlazeOrigin) {
            return;
          }

          console.info(
            "Received event from parent via postMessage...",
            event.data
          );

          const processError = (errorMessage: string) => {
            console.info(errorMessage);
            window.parent.postMessage(
              {
                identifier: "handshake_error",
                payload: {
                  message: errorMessage,
                },
              },
              ValidBlazeOrigin
            );
          };

          const eventIdentifier = event.data.identifier;
          const eventPayload = event.data.payload;
          if (!eventIdentifier) {
            processError("Failed to process event due to missing identifier!");
            return;
          }

          if (eventIdentifier === "handshake_response") {
            if (!eventPayload) {
              processError(
                `Failed to process ${eventIdentifier} event due to missing payload!`
              );
              return;
            }

            const blazeAuthPayload: BlazeAuthPayload = eventPayload;
            const {
              auth_key: authKey,
              company_id: blazeCompanyId,
              shop_id: blazeShopId,
              user_id: blazeUserId,
              user_role: blazeUserRole,
              user_email: blazeUserEmail,
              user_first_name: blazeUserFirstName,
              user_last_name: blazeUserLastName,
            } = blazeAuthPayload;

            if (
              authKey == null ||
              blazeCompanyId == null ||
              blazeShopId == null ||
              blazeUserId == null ||
              blazeUserRole == null ||
              blazeUserEmail == null ||
              blazeUserFirstName == null ||
              blazeUserLastName == null
            ) {
              processError(
                `Failed to process ${eventIdentifier} event due to missing payload field(s)!`
              );
              return;
            }

            // Trigger request to Python API server.
            const response = await authenticateBlazeUser({
              variables: {
                auth_key: authKey,
                external_blaze_company_id: blazeCompanyId,
                external_blaze_shop_id: blazeShopId,
                external_blaze_user_id: blazeUserId,
                external_blaze_user_role: blazeUserRole,
                external_blaze_user_email: blazeUserEmail,
                external_blaze_user_first_name: blazeUserFirstName,
                external_blaze_user_last_name: blazeUserLastName,
              },
            });

            if (response.status !== "OK") {
              console.info(
                `Failed to process ${eventIdentifier} event!`,
                response
              );
              window.parent.postMessage(
                {
                  identifier: "handshake_failure",
                  payload: null,
                },
                ValidBlazeOrigin
              );
            } else {
              console.info(`Processed ${eventIdentifier} event successfully!`);
              window.parent.postMessage(
                {
                  identifier: "handshake_success",
                  payload: null,
                },
                ValidBlazeOrigin
              );

              const data = response.data;
              if (data) {
                const authStatus = !!data?.auth_status
                  ? data.auth_status
                  : null;
                if (authStatus === BlazeAuthStatus.BorrowerActive) {
                  setUserFromAccessToken(data.access_token, data.refresh_token);
                } else if (
                  [
                    BlazeAuthStatus.ApplicantDenied,
                    BlazeAuthStatus.ApplicantPreapproved,
                  ].includes(authStatus)
                ) {
                  setBlazePreapproval(
                    !!response.data?.blaze_preapproval
                      ? (response.data
                          ?.blaze_preapproval as BlazePreapprovalFragment)
                      : null
                  );
                } else {
                  console.info(
                    `Failed to process ${eventIdentifier} event, data from API is invalid!`,
                    response
                  );
                }
                // Important: setBlazeAuthStatus must be called after setUserFromAccessToken.
                // Otherwise, there will be a render before the user state is configured.
                setBlazeAuthStatus(authStatus as BlazeAuthStatus);
              }
            }
          }
        },
        false
      );

      if (!!ValidBlazeOrigin) {
        window.parent.postMessage(
          {
            identifier: "handshake_request",
            payload: null,
          },
          ValidBlazeOrigin
        );
        console.info(
          "Sent handshake_request event from iframe via postMessage..."
        );
      } else {
        console.info(
          "Failed to send handshake_request event due to missing environment variable!"
        );
      }
    }
  }, [authenticateBlazeUser, setUserFromAccessToken]);

  // Set theme values dynamically based on whether App is in embedded mode or not.
  const theme = createTheme({
    palette: {
      primary: {
        main: user.isEmbeddedModule ? BlazePrimaryMain : BespokePrimaryMain,
        light: user.isEmbeddedModule ? BlazePrimaryLight : BespokePrimaryLight,
        contrastText: user.isEmbeddedModule
          ? BlazeContrastText
          : BespokeContrastText,
      },
    },
    typography: {
      fontFamily: (user.isEmbeddedModule
        ? BlazeTypographyFontFamily
        : BespokeTypographyFontFamily
      ).join(","),
      // TODO: customize letter spacing.
      // body1: {
      //   letterSpacing: 14,
      // },
      button: {
        textTransform: "none",
      },
    },
  });

  const isAppReady =
    (user.isEmbeddedModule && !!blazeAuthStatus) ||
    (!user.isEmbeddedModule && !isTokenLoading);
  const isBlazePreapprovalPage =
    !!blazeAuthStatus &&
    [
      BlazeAuthStatus.ApplicantDenied,
      BlazeAuthStatus.ApplicantPreapproved,
    ].includes(blazeAuthStatus);

  return isAppReady ? (
    <CurrentUserContext.Provider
      value={{
        user,
        isSignedIn,
        resetUser,
        setUserProductType,
        setUserIsActiveContract,
        undoImpersonation,
        impersonateUser,
        signIn,
        signOut,
      }}
    >
      <ThemeProvider theme={theme}>
        {isBlazePreapprovalPage ? (
          <BlazePreapprovalPage
            isAuthenticateBlazeUserLoading={isAuthenticateBlazeUserLoading}
            blazePreapproval={blazePreapproval}
          />
        ) : (
          props.children
        )}
      </ThemeProvider>
    </CurrentUserContext.Provider>
  ) : (
    <></>
  );
}
