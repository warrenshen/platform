import { Companies } from "generated/graphql";

// Frontend routes

export const routes = {
  root: "/",
  signIn: "/sign-in",
  userProfile: "/user-profile",
  users: "/users",
};

// Routes when you are neither a customer or bank, but you've been authenticated via the secure_link route
export const anonymousRoutes = {
  secureLink: "/get-secure-link",
  secureLinkNew: "/get-secure-link-new",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  reviewPurchaseOrder: "/review-purchase-order",
  reviewPurchaseOrderNew: "/review-purchase-order-new",
  reviewPurchaseOrderComplete: "/review-purchase-order-complete",
  reviewInvoice: "/review-invoice",
  reviewInvoiceComplete: "/review-invoice-complete",
  reviewInvoicePayment: "/review-invoice-payment",
  reviewInvoicePaymentComplete: "/review-invoice-payment-complete",
  getSecureLinkPayload: "/get-secure-link-payload",
  createVendor: "/vendor-form/:companyId",
  createVendorComplete: "/create-vendor-complete",
};

// Vendor user routes are prefixed with "/2".
export const vendorRoutes = {};

// Customer user routes are prefixed with "/1".
export const customerRoutes = {
  account: "/1/account",
  contract: "/1/contract",
  borrowingBase: "/1/borrowing-base",
  financialCertifications: "/1/financial-certifications",
  financingRequests: "/1/financing-requests",
  loans: "/1/loans",
  loansNew: "/1/loans-new",
  locations: "/1/locations",
  reports: "/1/reports",
  overview: "/1/overview",
  payments: "/1/payments",
  purchaseOrders: "/1/purchase-orders",
  purchaseOrdersNew: "/1/purchase-orders-new",
  settings: "/1/settings",
  vendors: "/1/vendors",
  invoices: "/1/invoices",
  payors: "/1/payors",
  users: "/1/users",
};

export enum BankCompanyRouteEnum {
  AccountFeesCredits = "/account",
  BorrowingBase = "/borrowing-base",
  FinancialCertifications = "/financial-certifications",
  FinancingRequests = "/financing-requests",
  Invoices = "/invoices",
  Loans = "/loans",
  LoansNew = "/loans-new",
  Reports = "/reports",
  Overview = "/overview",
  PurchaseOrders = "/purchase-orders",
  PurchaseOrdersNew = "/purchase-orders-new",
  PayorPartnerships = "/payor-partnerships",
  VendorPartnerships = "/vendor-partnerships",
}

// Bank user routes are not prefixed.
export const bankRoutes = {
  overview: "/overview",
  async: "/async",
  companies: "/companies",
  companyRoot: "/companies/:companyId",
  company: {
    accountFeesCredits: BankCompanyRouteEnum.AccountFeesCredits,
    contract: "/contract",
    borrowingBase: BankCompanyRouteEnum.BorrowingBase,
    financialCertifications: BankCompanyRouteEnum.FinancialCertifications,
    financingRequests: BankCompanyRouteEnum.FinancingRequests,
    loans: BankCompanyRouteEnum.Loans,
    loansNew: BankCompanyRouteEnum.LoansNew,
    reports: BankCompanyRouteEnum.Reports,
    overview: BankCompanyRouteEnum.Overview,
    payments: "/payments",
    purchaseOrders: BankCompanyRouteEnum.PurchaseOrders,
    purchaseOrdersNew: BankCompanyRouteEnum.PurchaseOrdersNew,
    payorPartnerships: BankCompanyRouteEnum.PayorPartnerships,
    vendorPartnerships: BankCompanyRouteEnum.VendorPartnerships,
    vendors: "/vendors",
    payors: "/payors",
    invoices: "/invoices",
    metrc: "/metrc",
    settings: "/settings",
    users: "/users",
  },
  customers: "/customers",
  ebbaApplications: "/client-surveillance",
  debtFacility: "/debt-facility",
  loans: "/loans",
  partnerships: "/partnerships",
  advances: "/advances",
  payments: "/payments",
  payors: "/payors",
  purchaseOrders: "/purchase-orders",
  purchaseOrdersNew: "/purchase-orders-new",
  invoices: "/invoices",
  metrcRoot: "/metrc",
  metrc: {
    transfer: "/transfer",
  },
  reports: "/reports",
  settings: "/settings",
  vendors: "/vendors",
};

export function getBankCompanyRoute(
  companyId: Companies["id"],
  bankCompanyRoute: BankCompanyRouteEnum
) {
  return `/companies/${companyId}${bankCompanyRoute}`;
}
