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
  reviewPurchaseOrder: "/review-purchase-order",
  reviewPurchaseOrderComplete: "/review-purchase-order-complete",
  resetPassword: "/reset-password",
  forgotPassword: "/forgot-password",
};

// Vendor user routes are prefixed with "/2".
export const vendorRoutes = {};

// Customer user routes are prefixed with "/1".
export const customerRoutes = {
  companyProfile: "/1/company-profile",
  contract: "/1/contract",
  ebbaApplications: "/1/borrowing-base",
  loans: "/1/loans",
  overview: "/1/overview",
  purchaseOrders: "/1/purchase-orders",
  settings: "/1/settings",
  vendors: "/1/vendors",
};

// Bank user routes are not prefixed.
export const bankRoutes = {
  overview: "/overview",
  advances: "/advances",
  bankAccounts: "/bank-accounts",
  customerRoot: "/customers/:companyId",
  customer: {
    companyProfile: "/company-profile",
    contract: "/contract",
    ebbaApplications: "/borrowing-base",
    overview: "/overview",
    loans: "/loans",
    purchaseOrders: "/purchase-orders",
    vendors: "/vendors",
    settings: "/settings",
    users: "/users",
  },
  customers: "/customers",
  ebbaApplications: "/borrowing-bases",
  loansAllProducts: "/loans-all-products",
  loansApprovalRequested: "/loans-approval-requested",
  loansLineOfCredit: "/loans-line-of-credit",
  loansMaturing: "/loans-maturing",
  loansPastDue: "/loans-past-due",
  loansPurchaseOrder: "/loans-purchase-order",
  payments: "/payments",
  paymentsReadyForSettlement: "/payments-ready-for-settlement",
  paymentsReverseDraftAch: "/payments-reverse-draft-ach",
  purchaseOrders: "/purchase-orders",
  transactions: "/transactions",
  vendors: "/vendors",
};
