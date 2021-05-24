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
  createPartnershipRequest: "/companies/create_partnership_request",
  deletePartnershipRequest: "/companies/delete_partnership_request",
  createPartnership: "/companies/create_partnership",
};

export const licenseRoutes = {
  addLicenses: "/licenses/add_licenses",
  createUpdateLicenses: "/licenses/create_update_licenses",
  deleteLicense: "/licenses/delete_license",
};

export const contractRoutes = {
  addContract: "/contracts/add_new_contract",
  terminateContract: "/contracts/terminate_contract",
  updateContract: "/contracts/update_contract",
};

export const userRoutes = {
  createLogin: "/users/create_login",
  createBankCustomerUser: "/users/create_bank_customer_user",
  createPayorVendorUser: "/users/create_payor_vendor_user",
  updatePayorVendorUser: "/users/update_payor_vendor_user",
};

export const notifyRoutes = {
  sendNotification: "/notify/send_notification",
};

export const ebbaApplicationsRoutes = {
  delete: "finance/ebba_applications/approvals/delete",
  respondToApprovalRequest:
    "finance/ebba_applications/approvals/respond_to_approval_request",
  submitForApproval: "/finance/ebba_applications/approvals/submit_for_approval",
};

export const purchaseOrdersRoutes = {
  createUpdateAsDraft: "/purchase_orders/create_update_as_draft",
  createUpdateAndSubmit: "/purchase_orders/create_update_and_submit",
  update: "/purchase_orders/update",
  submit: "/purchase_orders/submit",
  respondToApprovalRequest: "/purchase_orders/respond_to_approval_request",
  delete: "/purchase_orders/delete",
};

export const invoicesRoutes = {
  createUpdateAsDraft: "/invoices/create_update_as_draft",
  delete: "/invoices/delete",
  submitForApproval: "/invoices/submit_for_approval",
  respondToApprovalRequest: "/invoices/respond_to_approval_request",
  submitForPayment: "/invoices/submit_for_payment",
  submitNewInvoiceForPayment: "/invoices/submit_new_invoice_for_payment",
  respondToPaymentRequest: "/invoices/respond_to_payment_request",
};

export const loansRoutes = {
  // Loans related.
  submitForApproval: "/finance/loans/approvals/submit_for_approval",
  approveLoans: "/finance/loans/approvals/approve_loans",
  rejectLoan: "/finance/loans/approvals/reject_loan",

  deleteLoan: "/finance/loans/deletion/delete_loan",

  runCustomerBalances: "/finance/loans/reports/run_customer_balances",

  // Payments related.
  calculateRepaymentEffect:
    "finance/loans/repayments/calculate_effect_of_payment",
  createAdjustment: "/finance/loans/adjustments/make_adjustment",
  createAdvance: "/finance/loans/advances/handle_advance",
  createRepayment: "/finance/loans/repayments/create_repayment",
  scheduleRepayment: "/finance/loans/repayments/schedule_repayment",
  settleRepayment: "/finance/loans/repayments/settle_repayment",
  reverseRepayment: "/finance/loans/repayments/reverse_repayment",
  undoRepayment: "/finance/loans/repayments/undo_repayment",
  deleteRepayment: "/finance/loans/repayments/delete_repayment",

  // Artifacts related.
  listArtifactsForCreateLoan:
    "/finance/loans/artifacts/list_artifacts_for_create_loan",

  // purchase orders related
  upsertPurchaseOrdersLoans: "/finance/loans/purchase_orders/upsert",
};

export const feesRoutes = {
  createAccountLevelFee: "/finance/fees/make_account_level_fee",
  createAccountLevelFeeRepayment:
    "/finance/fees/make_account_level_fee_repayment",
  scheduleAccountLevelFeeRepayment:
    "finance/fees/schedule_account_level_fee_repayment",
  settleAccountLevelFeeRepayment:
    "/finance/fees/settle_account_level_fee_repayment",
};

export const twoFactorRoutes = {
  getSecureLinkPayload: "/two_factor/get_secure_link_payload",
  sendTwoFactorCode: "/two_factor/send_code",
};

export const metrcRoutes = {
  getTransfers: "/metrc/get_transfers",
  addApiKey: "/metrc/add_api_key",
  viewApiKey: "/metrc/view_api_key",
  syncMetrcData: "/metrc/sync_metrc_data",
};

const api = axios.create({
  baseURL: process.env.REACT_APP_BESPOKE_API_ENDPOINT,
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
  baseURL: process.env.REACT_APP_BESPOKE_API_ENDPOINT,
});

export type CustomMutationResponse = {
  status: string;
  msg: string;
  errors?: string[];
  data?: any;
};
