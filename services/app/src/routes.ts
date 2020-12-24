export const routes = {
  root: "/",
  overview: "/overview",
  loans: "/loans",
  purchaseOrders: "/purchase-orders",
  vendors: "/vendors",
  profile: "/profile",
  login: "/login",
  userProfile: "/user-profile",
};

export const bankPaths = {
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
