import { UserRolesEnum } from "generated/graphql";

// inspired by https://auth0.com/blog/role-based-access-control-rbac-and-react-apps/

export enum Action {
  // Bank Accounts
  AssignBespokeBankAccountForCustomer = "bank-accounts:assign-to-customer",

  // Loans
  ApproveLoan = "loans:approve",
  EditLoanInternalNote = "loans:edit-internal-note",
  RejectLoan = "loans:reject",
  ViewLoanInternalNote = "loans:view-internal-note",

  // Purchase Orders
  AddPurchaseOrders = "purchase-orders:add",
  ViewPurchaseOrdersActionMenu = "purchase-orders:view-action-menu",
  ManipulatePurchaseOrders = "purchase-orders:manipulate",

  // Purchase Order Loans
  DisbursePurchaseOrderLoans = "purchase-order-loans:disburse",
  EditPurchaseOrderLoan = "purchase-order-loan:edit",
  RepayPurchaseOrderLoans = "purchase-order-loans:repay",

  // Users
  ManipulateUser = "users:manipulate",

  // Settings
  EditUserAccountSettings = "account_settings:edit",
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
  [UserRolesEnum.BankAdmin]: Rule;
  [UserRolesEnum.CompanyAdmin]: Rule;
}

export const check = (
  role: UserRolesEnum,
  action: Action,
  data?: ActionData
) => {
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
  [UserRolesEnum.CompanyAdmin]: {
    static: [
      Action.AddPurchaseOrders,
      Action.EditPurchaseOrderLoan,
      Action.ManipulatePurchaseOrders,
      Action.ManipulateUser,
      Action.RepayPurchaseOrderLoans,
      Action.ViewPurchaseOrdersActionMenu,
    ],
    dynamic: [
      {
        action: Action.ManipulateUser,
        condition: ({ currentUserId, userIdForCheck }: ActionData) =>
          currentUserId === userIdForCheck,
      },
    ],
  },
  [UserRolesEnum.BankAdmin]: {
    static: [
      Action.AssignBespokeBankAccountForCustomer,

      Action.DisbursePurchaseOrderLoans,

      Action.ApproveLoan,
      Action.RejectLoan,
      Action.EditLoanInternalNote,
      Action.ViewLoanInternalNote,

      Action.EditUserAccountSettings,
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
