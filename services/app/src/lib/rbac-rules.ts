import { UserRole } from "contexts/CurrentUserContext";

// inspired by https://auth0.com/blog/role-based-access-control-rbac-and-react-apps/

export enum Action {
  AddPurchaseOrders = "purchase-orders:add",
  ViewPurchaseOrdersActionMenu = "purchase-orders:view-action-menu",
  ManipulatePurchaseOrders = "purchase-orders:manipulate",
}

export interface Rule {
  static: Array<Action>;
}
export interface Rules {
  [UserRole.BankAdmin]: Rule;
  [UserRole.CompanyAdmin]: Rule;
}

export const check = (role: UserRole, action: Action) => {
  const permissions = rules[role];
  return permissions.static.includes(action);
};

const rules: Rules = {
  [UserRole.CompanyAdmin]: {
    static: [
      Action.AddPurchaseOrders,
      Action.ManipulatePurchaseOrders,
      Action.ViewPurchaseOrdersActionMenu,
    ],
  },
  [UserRole.BankAdmin]: {
    static: [],
  },
};

export default rules;
