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
  payments: "/1/payments",
  purchaseOrders: "/1/purchase-orders",
  settings: "/1/settings",
  vendors: "/1/vendors",
  invoices: "/1/invoices",
  payors: "/1/payors",
  users: "/1/users",
};

// Bank user routes are not prefixed.
export const bankRoutes = {
  overview: "/overview",
  customerRoot: "/customers/:companyId",
  customer: {
    contract: "/contract",
    ebbaApplications: "/borrowing-base",
    loans: "/loans",
    overview: "/overview",
    payments: "/payments",
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
  payments: "/payments",
  payors: "/payors",
  purchaseOrders: "/purchase-orders",
  invoices: "/invoices",
  reports: "/reports",
  settings: "/settings",
  vendors: "/vendors",
};
