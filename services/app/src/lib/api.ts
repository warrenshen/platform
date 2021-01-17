import axios from "axios";
import { getAccessToken } from "lib/auth/tokenStorage";

export const authRoutes = {
  signIn: "/auth/sign-in",
  resetPassword: "/auth/reset-password",
  refreshToken: "/auth/token/refresh",
  revokeAccessToken: "/auth/sign-out/access",
  revokeRefreshToken: "/auth/sign-out/refresh",
};

export const notifyRoutes = {
  sendNotification: "/notify/send",
};

export const fileRoutes = {
  putSignedUrl: "/files/put_signed_url",
  uploadSignedUrl: "/files/upload_signed_url",
};

const api = axios.create({
  baseURL: `${process.env.REACT_APP_BESPOKE_API_ENDPOINT}`,
});

api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  return {
    ...config,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
});

export const authenticatedApi = api;

export const unAuthenticatedApi = axios.create({
  baseURL: `${process.env.REACT_APP_BESPOKE_API_ENDPOINT}`,
});
