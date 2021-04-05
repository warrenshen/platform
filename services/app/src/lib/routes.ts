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
  contract: "/1/contract",
  ebbaApplications: "/1/borrowing-base",
  loans: "/1/loans",
  overview: "/1/overview",
  purchaseOrders: "/1/purchase-orders",
  settings: "/1/settings",
  vendors: "/1/vendors",
  invoices: "/1/invoices",
  payors: "/1/payors",
};

// Bank user routes are not prefixed.
export const bankRoutes = {
  overview: "/overview",
  advances: "/advances",
  bankAccounts: "/bank-accounts",
  customerRoot: "/customers/:companyId",
  customer: {
    contract: "/contract",
    ebbaApplications: "/borrowing-base",
    overview: "/overview",
    loans: "/loans",
    purchaseOrders: "/purchase-orders",
    vendors: "/vendors",
    payors: "/payors",
    invoices: "/invoices",
    settings: "/settings",
    users: "/users",
  },
  customers: "/customers",
  ebbaApplications: "/borrowing-bases",
  loans: "/loans",
  payments: "/payments-all",
  paymentsActionRequired: "/payments-action-required",
  purchaseOrders: "/purchase-orders",
  invoices: "/invoices",
  reports: "/reports",
  transactions: "/transactions",
  vendors: "/vendors",
  payors: "/payors",
};
