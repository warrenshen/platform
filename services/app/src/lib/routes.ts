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

export const customerRoutes = {
  loans: "/loans",
  settings: "/settings",
  purchaseOrders: "/purchase-orders",
};

export const bankRoutes = {
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
