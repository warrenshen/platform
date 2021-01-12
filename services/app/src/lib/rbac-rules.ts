import { UserRole } from "contexts/CurrentUserContext";

// inspired by https://auth0.com/blog/role-based-access-control-rbac-and-react-apps/

export enum Action {
  AddPurchaseOrders = "purchase-orders:add",
  ViewPurchaseOrdersActionMenu = "purchase-orders:view-action-menu",
  ManipulatePurchaseOrders = "purchase-orders:manipulate",
  ManipulateUser = "users:manipulate",
  AssignBespokeBankAccountForCustomer = "bank-accounts:assign-to-customer",
  RepayPurchaseOrderLoans = "purchase-order-loans:repay",
  DisbursePurchaseOrderLoans = "purchase-order-loans:disburse",
}

export interface ActionData {
  currentUserId: string;
  userIdForCheck: string;
}

export interface DynamicAction {
  action: Action;
  condition: (data: ActionData) => boolean;
}

export interface Rule {
  static: Array<Action>;
  dynamic: Array<DynamicAction>;
}
export interface Rules {
  [UserRole.BankAdmin]: Rule;
  [UserRole.CompanyAdmin]: Rule;
}

export const check = (role: UserRole, action: Action, data?: ActionData) => {
  const permissions = rules[role];

  if (!permissions) {
    return false;
  }

  const staticPermissions = permissions.static;

  if (staticPermissions && staticPermissions.length > 0) {
    return staticPermissions.includes(action);
  }

  const dynamicPermissions = permissions.dynamic;

  if (dynamicPermissions && dynamicPermissions.length > 0) {
    const dynamicPermission = dynamicPermissions.find(
      (p) => p.action === action
    );
    if (dynamicPermission && data) {
      return dynamicPermission.condition(data);
    }
  }
  return false;
};

const rules: Rules = {
  [UserRole.CompanyAdmin]: {
    static: [
      Action.AddPurchaseOrders,
      Action.ManipulatePurchaseOrders,
      Action.ViewPurchaseOrdersActionMenu,
      Action.ManipulateUser,
      Action.RepayPurchaseOrderLoans,
    ],
    dynamic: [
      {
        action: Action.ManipulateUser,
        condition: ({ currentUserId, userIdForCheck }: ActionData) =>
          currentUserId === userIdForCheck,
      },
    ],
  },
  [UserRole.BankAdmin]: {
    static: [
      Action.AssignBespokeBankAccountForCustomer,
      Action.DisbursePurchaseOrderLoans,
    ],
    dynamic: [
      {
        action: Action.ManipulateUser,
        condition: ({ currentUserId, userIdForCheck }: ActionData) =>
          currentUserId === userIdForCheck,
      },
    ],
  },
};

export default rules;
