export const routes = {
  root: "/",
  overview: "/overview",
  loans: "/loans",
  purchaseOrders: "/purchase-orders",
  vendors: "/vendors",
  profile: "/profile",
};

export const bankPaths = {
  customers: "/customers",
  customer: {
    root: "/customers/:customerId",
    overview: "/overview",
    loans: "/loans",
    purchaseOrders: "/purchase-orders",
    vendors: "/vendors",
    profile: "/profile",
    users: "/users",
  },
};
