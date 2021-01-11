import * as Sentry from "@sentry/react";
import jwtDecode from "jwt-decode";
import { useCallback } from "react";
import { authEndpoints } from "routes";

const LOCAL_STORAGE_ACCESS_TOKEN_KEY = "access_token";
const LOCAL_STORAGE_REFRESH_TOKEN_KEY = "refresh_token";

export type Storage = {
  getAccessToken: () => Promise<string | null>;
  setAccessToken: (token: string) => void;
  removeAccessToken: () => void;
  getRefreshToken: () => string | null;
  setRefreshToken: (token: string) => void;
  removeRefreshToken: () => void;
};

function isTokenExpired(token: string) {
  const decodedToken: any = jwtDecode(token);
  return decodedToken["exp"] * 1000 < Date.now();
}

function useTokenStorage(): Storage {
  const removeAccessToken = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_ACCESS_TOKEN_KEY);
  }, []);

  const removeRefreshToken = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_REFRESH_TOKEN_KEY);
  }, []);

  const setRefreshToken = useCallback((token: string) => {
    localStorage.setItem(LOCAL_STORAGE_REFRESH_TOKEN_KEY, token);
  }, []);

  const getRefreshToken = useCallback(() => {
    return localStorage.getItem(LOCAL_STORAGE_REFRESH_TOKEN_KEY) || null;
  }, []);

  const setAccessToken = useCallback((token: string) => {
    localStorage.setItem(LOCAL_STORAGE_ACCESS_TOKEN_KEY, token);
  }, []);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    const accessToken = localStorage.getItem(LOCAL_STORAGE_ACCESS_TOKEN_KEY);
    const refreshToken = getRefreshToken();

    if (
      refreshToken &&
      (!accessToken || (accessToken && isTokenExpired(accessToken)))
    ) {
      try {
        const response = await fetch(authEndpoints.refreshToken, {
          method: "POST",
          mode: "cors",
          cache: "no-cache",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${refreshToken}`,
          },
        });
        const data = await response.json();
        if (data.status === "OK" && data.access_token) {
          setAccessToken(data.access_token);
          return data.access_token;
        }
      } catch (e) {
        Sentry.captureException(e);
      } finally {
        return null;
      }
    } else if (refreshToken && accessToken) {
      return accessToken;
    } else {
      return null;
    }
  }, [setAccessToken, getRefreshToken]);

  return {
    getAccessToken,
    setAccessToken,
    removeAccessToken,
    getRefreshToken,
    setRefreshToken,
    removeRefreshToken,
  };
}

export default useTokenStorage;
