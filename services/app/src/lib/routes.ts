// Frontend routes

export const routes = {
  root: "/",
  signIn: "/sign-in",
  overview: "/overview",
  profile: "/profile",
  userProfile: "/user-profile",
  users: "/users",
};

// Routes when you are neither a customer or bank, but you've been authenticated via the secure_link route
export const anonymousRoutes = {
  secureLink: "/get_secure_link",
  reviewPurchaseOrder: "/review-purchase-order",
  reviewPurchaseOrderComplete: "/review-purchase-order-complete",
};

// Vendor user routes are prefixed with "/2".
export const vendorRoutes = {};

// Customer user routes are prefixed with "/1".
export const customerRoutes = {
  loans: "/1/loans",
  purchaseOrders: "/1/purchase-orders",
  settings: "/1/settings",
  vendors: "/1/vendors",
};

// Bank user routes are not prefixed.
export const bankRoutes = {
  bankAccounts: "/bank-accounts",
  customer: {
    root: "/customers/:companyId",
    overview: "/overview",
    loans: "/loans",
    purchaseOrders: "/purchase-orders",
    vendors: "/vendors",
    settings: "/settings",
    profile: "/profile",
    users: "/users",
  },
  customers: "/customers",
  loansAllProducts: "/loans-all-products",
  loansLineOfCredit: "/loans-line-of-credit",
  loansMaturing: "/loans-maturing",
  loansPastDue: "/loans-past-due",
  loansPurchaseOrder: "/loans-purchase-order",
  vendors: "/vendors",
};
