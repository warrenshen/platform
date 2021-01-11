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

export const authEndpoints = {
  signIn: `${process.env.REACT_APP_BESPOKE_API_ENDPOINT}/auth/sign-in`,
  resetPassword: `${process.env.REACT_APP_BESPOKE_API_ENDPOINT}/auth/reset-password`,
  refreshToken: `${process.env.REACT_APP_BESPOKE_API_ENDPOINT}/auth/token/refresh`,
  revokeAccessToken: `${process.env.REACT_APP_BESPOKE_API_ENDPOINT}/auth/sign-out/access`,
  revokeRefreshToken: `${process.env.REACT_APP_BESPOKE_API_ENDPOINT}/auth/sign-out/refresh`,
};
