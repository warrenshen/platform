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

export const companyRoutes = {
  createCustomer: "/companies/create_customer",
};

export const contractRoutes = {
  addContract: "/contracts/add_new_contract",
  terminateContract: "/contracts/terminate_contract",
  updateContract: "/contracts/update_contract",
};

export const userRoutes = {
  createLogin: "/users/create_login",
};

export const notifyRoutes = {
  sendNotification: "/notify/send_notification",
};

export const ebbaApplicationsRoutes = {
  respondToApprovalRequest:
    "finance/ebba_applications/approvals/respond_to_approval_request",
  submitForApproval: "/finance/ebba_applications/approvals/submit_for_approval",
};

export const purchaseOrdersRoutes = {
  respondToApprovalRequest: "/purchase_orders/respond_to_approval_request",
  submitForApproval: "/purchase_orders/submit_for_approval",
};

export const invoicesRoutes = {
  create: "/invoices/create",
  update: "/invoices/update",
  submitForApproval: "/invoices/submit_for_approval",
  respondToApprovalRequest: "/invoices/respond_to_approval_request",
};

export const loansRoutes = {
  // Loans related.
  submitForApproval: "/finance/loans/approvals/submit_for_approval",
  approveLoans: "/finance/loans/approvals/approve_loans",
  rejectLoan: "/finance/loans/approvals/reject_loan",
  runCustomerBalances: "/finance/loans/reports/run_customer_balances",

  // Payments related.
  calculateEffectOfPayment:
    "finance/loans/repayments/calculate_effect_of_payment",
  createAdvance: "/finance/loans/advances/handle_advance",
  createRepayment: "/finance/loans/repayments/create_repayment",
  scheduleRepayment: "/finance/loans/repayments/schedule_repayment",
  settleRepayment: "/finance/loans/repayments/settle_repayment",

  // Artifacts related.
  listArtifactsForCreateLoan:
    "/finance/loans/artifacts/list_artifacts_for_create_loan",

  // purchase orders related
  upsertPurchaseOrdersLoans: "/finance/loans/purchase_orders/upsert",
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

export type CustomMutationResponse = {
  status: string;
  msg: string;
  errors?: string[];
  data?: any;
};
