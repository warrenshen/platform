// Frontend routes

export const routes = {
  root: "/",
  signIn: "/sign-in",
  overview: "/overview",
  vendors: "/vendors",
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
  settings: "/1/settings",
  purchaseOrders: "/1/purchase-orders",
};

// Bank user routes are not prefixed.
export const bankRoutes = {
  loansMaturing: "/loans-maturing",
  loansPastDue: "/loans-past-due",
  loansAllProducts: "/loans-all-products",
  loansPurchaseOrder: "/loans-purchase-order",
  loansLineOfCredit: "/loans-line-of-credit",
  bankAccounts: "/bank-accounts",
  customers: "/customers",
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
};
