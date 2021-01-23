import * as Sentry from "@sentry/react";
import jwtDecode from "jwt-decode";
import { authRoutes, unAuthenticatedApi } from "lib/api";

const LOCAL_STORAGE_ACCESS_TOKEN_KEY = "access_token";
const LOCAL_STORAGE_REFRESH_TOKEN_KEY = "refresh_token";

function isTokenExpired(token: string) {
  const decodedToken: any = jwtDecode(token);
  return decodedToken["exp"] * 1000 < Date.now();
}

export const removeAccessToken = () => {
  localStorage.removeItem(LOCAL_STORAGE_ACCESS_TOKEN_KEY);
};

export const removeRefreshToken = () => {
  localStorage.removeItem(LOCAL_STORAGE_REFRESH_TOKEN_KEY);
};

export const setRefreshToken = (token: string) => {
  localStorage.setItem(LOCAL_STORAGE_REFRESH_TOKEN_KEY, token);
};

export const getRefreshToken = () => {
  return localStorage.getItem(LOCAL_STORAGE_REFRESH_TOKEN_KEY) || null;
};

export const setAccessToken = (token: string) => {
  localStorage.setItem(LOCAL_STORAGE_ACCESS_TOKEN_KEY, token);
};

export const getAccessToken = async (): Promise<string | null> => {
  const accessToken = localStorage.getItem(LOCAL_STORAGE_ACCESS_TOKEN_KEY);
  const refreshToken = getRefreshToken();

  if (
    refreshToken &&
    (!accessToken || (accessToken && isTokenExpired(accessToken)))
  ) {
    try {
      const response = await unAuthenticatedApi.post(
        authRoutes.refreshToken,
        {},
        {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        }
      );
      const data = response.data;
      if (data.status === "OK" && data.access_token) {
        setAccessToken(data.access_token);
        return data.access_token;
      } else {
        return null;
      }
    } catch (e) {
      Sentry.captureException(e);
      return null;
    }
  } else if (refreshToken && accessToken) {
    return accessToken;
  } else if (accessToken) {
    // TODO(dlluncor): Are there any downsides to allowing for an access token with no refresh token?
    return accessToken;
  } else {
    return null;
  }
};
