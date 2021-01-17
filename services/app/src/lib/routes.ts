// Frontend endpoints

export const routes = {
  root: "/",
  overview: "/overview",
  loans: "/loans",
  purchaseOrders: "/purchase-orders",
  vendors: "/vendors",
  profile: "/profile",
  signIn: "/signIn",
  userProfile: "/user-profile",
  users: "/users",
};

export const bankPaths = {
  bankAccounts: "/bank-accounts",
  customers: "/customers",
  customer: {
    root: "/customers/:companyId",
    overview: "/overview",
    loans: "/loans",
    purchaseOrders: "/purchase-orders",
    vendors: "/vendors",
    profile: "/profile",
    users: "/users",
  },
};
