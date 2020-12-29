export const routes = {
  root: "/",
  overview: "/overview",
  loans: "/loans",
  purchaseOrders: "/purchase-orders",
  vendors: "/vendors",
  profile: "/profile",
  login: "/login",
  userProfile: "/user-profile",
  users: "/users",
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

export const authEndpoints = {
  login: `${process.env.REACT_APP_BESPOKE_API_ENDPOINT}/auth/login`,
};
