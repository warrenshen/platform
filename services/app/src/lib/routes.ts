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
  invoices: "/1/invoices",
  loans: "/1/loans",
  locations: "/1/locations",
  reports: "/1/reports",
  overview: "/1/overview",
  payors: "/1/payors",
  purchaseOrders: "/1/purchase-orders",
  repayments: "/1/repayments",
  settings: "/1/settings",
  users: "/1/users",
  vendors: "/1/vendors",
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
  advances: "/advances",
  async: "/async",
  companies: "/companies",
  companyRoot: "/companies/:companyId",
  company: {
    accountFeesCredits: BankCompanyRouteEnum.AccountFeesCredits,
    borrowingBase: BankCompanyRouteEnum.BorrowingBase,
    contract: "/contract",
    financialCertifications: BankCompanyRouteEnum.FinancialCertifications,
    financingRequests: BankCompanyRouteEnum.FinancingRequests,
    invoices: "/invoices",
    loans: BankCompanyRouteEnum.Loans,
    overview: BankCompanyRouteEnum.Overview,
    metrc: "/metrc",
    payors: "/payors",
    payorPartnerships: BankCompanyRouteEnum.PayorPartnerships,
    purchaseOrders: BankCompanyRouteEnum.PurchaseOrders,
    repayments: "/repayments",
    reports: BankCompanyRouteEnum.Reports,
    settings: "/settings",
    users: "/users",
    vendorPartnerships: BankCompanyRouteEnum.VendorPartnerships,
    vendors: "/vendors",
  },
  customers: "/customers",
  debtFacility: "/debt-facility",
  ebbaApplications: "/client-surveillance",
  financingRequests: "/financing-requests",
  invoices: "/invoices",
  loans: "/loans",
  overview: "/overview",
  metrcRoot: "/metrc",
  metrc: {
    transfer: "/transfer",
  },
  partnerships: "/partnerships",
  payors: "/payors",
  purchaseOrdersNew: "/purchase-orders",
  productCatalog: "/product-catalog",
  repayments: "/repayments",
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
