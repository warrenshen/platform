import axios from "axios";
import { getAccessToken } from "lib/auth/tokenStorage";

export const authRoutes = {
  signIn: "/auth/sign-in",
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/reset-password",
  refreshToken: "/auth/token/refresh",
  revokeAccessToken: "/auth/sign-out/access",
  revokeRefreshToken: "/auth/sign-out/refresh",
  switchLocation: "/auth/switch-location",
};

export const fileRoutes = {
  putSignedUrl: "/files/put_signed_url",
  anonymousPutSignedUrl: "/files/anonymous_put_signed_url",
  uploadSignedUrl: "/files/upload_signed_url",
  anonymousUploadSignedUrl: "/files/anonymous_upload_signed_url",
  downloadSignedUrl: "/files/download_signed_url",
  anonymousDownloadSignedUrl: "/files/anonymous_download_signed_url",
};

export const companyRoutes = {
  createCustomer: "/companies/create_customer",
  createProspectiveCustomer: "/companies/create_prospective_customer",
  updateCustomerSurveillanceResult:
    "/companies/update_company_qualifying_product",
  createCustomerSurveillanceResult:
    "/companies/create_company_qualifying_product",
  createPartnershipRequest: "/companies/create_partnership_request",
  createPartnershipRequestNew: "/companies/create_partnership_request_new",
  updatePartnershipRequestNew: "/companies/update_partnership_request_new",
  addVendorNew: "/companies/add_vendor_new",
  deletePartnershipRequest: "/companies/delete_partnership_request",
  createPartnership: "/companies/create_partnership",
  createPartnershipNew: "/companies/create_partnership_new",
  approvePartnership: "/companies/approve_partnership",
  markPartnershipInviteAsComplete:
    "/companies/mark_company_partnership_complete",
  upsertCustomMessages: "/companies/upsert_custom_messages",
  upsertFeatureFlags: "/companies/upsert_feature_flags",
};

export const companyFacilitiesRoutes = {
  createUpdateCompanyFacility:
    "/company_facilities/create_update_company_facility",
  deleteCompanyFacility: "/company_facilities/delete_company_facility",
};

export const partnershipRoutes = {
  updatePartnershipContacts: "/partnerships/update_partnership_contacts",
};

export const licenseRoutes = {
  createUpdateLicense: "/licenses/create_update_license",
  createUpdateLicenses: "/licenses/create_update_licenses",
  deleteLicense: "/licenses/delete_license",
};

export const contractRoutes = {
  addContract: "/contracts/add_new_contract",
  deleteContract: "/contracts/delete_contract",
  terminateContract: "/contracts/terminate_contract",
  updateContract: "/contracts/update_contract",
};

export const userRoutes = {
  createLogin: "/users/create_login",
  createBankCustomerUser: "/users/create_bank_customer_user",
  deactivateCustomerUser: "/users/deactivate_customer_user",
  reactivateCustomerUser: "/users/reactivate_customer_user",
  updateUser: "/users/update_user",
};

export const notifyRoutes = {
  sendNotification: "/notify/send_notification",
};

export const ebbaApplicationsRoutes = {
  delete: "finance/ebba_applications/approvals/delete",
  respondToApprovalRequest:
    "finance/ebba_applications/approvals/respond_to_approval_request",
  submitForApproval: "/finance/ebba_applications/approvals/submit_for_approval",
  addFinancialReport:
    "finance/ebba_applications/approvals/add_financial_report",
  updateFinancialReport:
    "finance/ebba_applications/approvals/update_financial_report",
  addBorrowingBase: "finance/ebba_applications/approvals/add_borrowing_base",
  updateBorrowingBase:
    "finance/ebba_applications/approvals/update_borrowing_base",
};

export const purchaseOrdersRoutes = {
  createUpdateAsDraft: "/purchase_orders/create_update_as_draft",
  createUpdateAndSubmit: "/purchase_orders/create_update_and_submit",
  update: "/purchase_orders/update",
  submit: "/purchase_orders/submit",
  respondToApprovalRequest: "/purchase_orders/respond_to_approval_request",
  respondToIncompleteRequest: "/purchase_orders/respond_to_incomplete_request",
  updateBankFields: "/purchase_orders/update_bank_fields",
  delete: "/purchase_orders/delete",
  close: "/purchase_orders/close",
  reopen: "/purchase_orders/reopen",
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
  editRepayment: "/finance/loans/repayments/edit_repayment",
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
  createAccountLevelFeeWaiver: "finance/fees/make_account_level_fee_waiver",
  scheduleAccountLevelFeeRepayment:
    "finance/fees/schedule_account_level_fee_repayment",
  settleAccountLevelFeeRepayment:
    "/finance/fees/settle_account_level_fee_repayment",
  getAllMinimumInterestFeesDue:
    "/finance/fees/get_all_minimum_interest_fees_due",
  submitMinimumInterestFeesDue:
    "/finance/fees/submit_minimum_interest_fees_due",
  getAllMonthEndPayments: "/finance/fees/get_all_month_end_payments",
  submitMonthEndPayments: "/finance/fees/submit_month_end_payments",
};

export const bankAccountsRoutes = {
  deleteBankAccount: "/bank_accounts/delete_bank_account",
  createBankAccount: "/bank_accounts/create_bank_account",
  updateBankAccount: "/bank_accounts/update_bank_account",
};

export const creditsRoutes = {
  createCreditForCustomer: "/finance/credits/create_credit_for_customer",
  disburseCreditToCustomer: "/finance/credits/disburse_credit_to_customer",
};

export const twoFactorRoutes = {
  getSecureLinkPayload: "/two_factor/get_secure_link_payload",
  sendTwoFactorCode: "/two_factor/send_code",
};

export const metrcRoutes = {
  getTransfers: "/metrc/get_transfers",
  upsertApiKey: "/metrc/upsert_api_key",
  deleteApiKey: "/metrc/delete_api_key",
  viewApiKey: "/metrc/view_api_key",
  downloadMetrcDataForCompany: "/metrc/download_metrc_data_for_company",
  downloadMetrcDataAllCompanies: "/metrc/download_metrc_data_all_companies",
};

export const reportsRoutes = {
  monthlySummaryLOC: "/reports/generate_monthly_loans_summary_loc",
  monthlySummaryNonLOC: "/reports/generate_monthly_loans_summary_non_loc",
};

export const debtFacilityRoutes = {
  createUpdateFacility: "debt_facility/create_update_facility",
  updateCompanyStatus: "debt_facility/update_company_status",
  moveLoans: "debt_facility/move_loans",
  resolveLoans: "debt_facility/resolve_update_required",
  updateAssignedDate: "debt_facility/update_assigned_date",
  checkPastDue: "debt_facility/check_for_past_due_loans_in_debt_facility",
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
