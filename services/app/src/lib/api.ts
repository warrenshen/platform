import axios from "axios";
import { getAccessToken } from "lib/auth/tokenStorage";

export const authRoutes = {
  signIn: "/auth/sign-in",
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/reset-password",
  refreshToken: "/auth/token/refresh",
  revokeAccessToken: "/auth/sign-out/access",
  revokeRefreshToken: "/auth/sign-out/refresh",
};

export const fileRoutes = {
  putSignedUrl: "/files/put_signed_url",
  uploadSignedUrl: "/files/upload_signed_url",
  downloadSignedUrl: "/files/download_signed_url",
};

export const userRoutes = {
  createLogin: "/users/create_login",
};

export const notifyRoutes = {
  sendNotification: "/notify/send_notification",
};

export const ebbaApplicationsRoutes = {
  submitForApproval: "/finance/ebba_applications/approvals/submit_for_approval",
};

export const purchaseOrdersRoutes = {
  respondToApprovalRequest: "/purchase_orders/respond_to_approval_request",
  submitForApproval: "/purchase_orders/submit_for_approval",
};

export const loansRoutes = {
  createPaymentAdvance: "/finance/loans/advances/handle_advance",
  submitForApproval: "/finance/loans/approvals/submit_for_approval",
  approveLoan: "/finance/loans/approvals/approve_loan",
  rejectLoan: "/finance/loans/approvals/reject_loan",
  makePayment: "/finance/loans/repayments/handle_payment",
  calculateEffectOfPayment:
    "finance/loans/repayments/calculate_effect_of_payment",
};

export const twoFactorRoutes = {
  getSecureLinkPayload: "/two_factor/get_secure_link_payload",
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
      ...config.headers,
    },
  };
});

export const authenticatedApi = api;

export const unAuthenticatedApi = axios.create({
  baseURL: `${process.env.REACT_APP_BESPOKE_API_ENDPOINT}`,
});
