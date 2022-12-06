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
  reviewPurchaseOrderOld: "/review-purchase-order-old",
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
  locations: "/1/locations",
  reports: "/1/reports",
  overview: "/1/overview",
  payments: "/1/payments",
  purchaseOrdersNew: "/1/purchase-orders",
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
  Reports = "/reports",
  Overview = "/overview",
  PurchaseOrders = "/purchase-orders",
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
    reports: BankCompanyRouteEnum.Reports,
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
  customers: "/customers",
  ebbaApplications: "/client-surveillance",
  debtFacility: "/debt-facility",
  financingRequests: "/financing-requests",
  loans: "/loans",
  partnerships: "/partnerships",
  advances: "/advances",
  payments: "/payments",
  payors: "/payors",
  purchaseOrdersNew: "/purchase-orders",
  invoices: "/invoices",
  metrcRoot: "/metrc",
  metrc: {
    transfer: "/transfer",
  },
  productCatalog: "/product-catalog",
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
