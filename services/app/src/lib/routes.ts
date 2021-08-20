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
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  reviewPurchaseOrder: "/review-purchase-order",
  reviewPurchaseOrderComplete: "/review-purchase-order-complete",
  reviewInvoice: "/review-invoice",
  reviewInvoiceComplete: "/review-invoice-complete",
  reviewInvoicePayment: "/review-invoice-payment",
  reviewInvoicePaymentComplete: "/review-invoice-payment-complete",
  getSecureLinkPayload: "/get-secure-link-payload",
};

// Vendor user routes are prefixed with "/2".
export const vendorRoutes = {};

// Customer user routes are prefixed with "/1".
export const customerRoutes = {
  account: "/1/account",
  contract: "/1/contract",
  ebbaApplications: "/1/borrowing-base",
  loans: "/1/loans",
  overview: "/1/overview",
  payments: "/1/payments",
  purchaseOrders: "/1/purchase-orders",
  settings: "/1/settings",
  vendors: "/1/vendors",
  invoices: "/1/invoices",
  payors: "/1/payors",
  users: "/1/users",
};

export enum BankCompanyRouteEnum {
  AccountFeesCredits = "/account",
  EbbaApplications = "/borrowing-base",
  Loans = "/loans",
  Overview = "/overview",
  PurchaseOrders = "/purchase-orders",
  PayorPartnerships = "/payor-partnerships",
  VendorPartnerships = "/vendor-partnerships",
}

// Bank user routes are not prefixed.
export const bankRoutes = {
  overview: "/overview",
  companyRoot: "/companies/:companyId",
  company: {
    accountFeesCredits: BankCompanyRouteEnum.AccountFeesCredits,
    contract: "/contract",
    ebbaApplications: BankCompanyRouteEnum.EbbaApplications,
    loans: BankCompanyRouteEnum.Loans,
    overview: BankCompanyRouteEnum.Overview,
    payments: "/payments",
    purchaseOrders: BankCompanyRouteEnum.PurchaseOrders,
    payorPartnerships: BankCompanyRouteEnum.PayorPartnerships,
    vendorPartnerships: BankCompanyRouteEnum.VendorPartnerships,
    vendors: "/vendors",
    payors: "/payors",
    invoices: "/invoices",
    metrc: "/metrc",
    settings: "/settings",
    users: "/users",
  },
  asyncJobs: "/async/jobs",
  customers: "/customers",
  ebbaApplications: "/client-surveillance",
  loans: "/loans",
  partnerships: "/partnerships",
  advances: "/advances",
  payments: "/payments",
  payors: "/payors",
  purchaseOrders: "/purchase-orders",
  invoices: "/invoices",
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
