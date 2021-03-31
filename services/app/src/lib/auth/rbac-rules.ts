import { UserRolesEnum } from "generated/graphql";

// inspired by https://auth0.com/blog/role-based-access-control-rbac-and-react-apps/

export enum Action {
  // Bank Accounts
  AssignBespokeBankAccountForCustomer = "bank-accounts:assign-to-customer",
  AddBankAccount = "bank-accounts:add",
  EditBankAccount = "bank-accounts:edit",
  EditCustomerSettings = "bank-accounts:edit-customer-settings",
  EditTerms = "bank-accounts:edit-terms",
  TerminateContract = "bank-accounts:terminate-contract",

  // Loans
  ApproveLoan = "loans:approve",
  EditLoanInternalNote = "loans:edit-internal-note",
  RejectLoan = "loans:reject",
  ViewLoanInternalNote = "loans:view-internal-note",
  SelectLoan = "loans:select",
  DeselectLoan = "loans:deselect",
  CreateAdvance = "loans:create-advance",
  RunBalances = "loans:run-balances",

  // Purchase Orders
  AddPurchaseOrders = "purchase-orders:add",
  EditPurchaseOrders = "purchase-orders:manipulate",
  FundPurchaseOrders = "purchase-orders:fund",
  ViewPurchaseOrdersActionMenu = "purchase-orders:view-action-menu",

  // Purchase Order Loans
  AddPurchaseOrderLoan = "purchase-order-loan:add",
  DisbursePurchaseOrderLoans = "purchase-order-loans:disburse",
  EditPurchaseOrderLoan = "purchase-order-loan:edit",
  RepayPurchaseOrderLoans = "purchase-order-loans:repay",

  // Invoices
  AddInvoices = "invoices:add",
  EditInvoices = "invoices:add",
  FundInvoices = "invoices:fund",
  ViewInvoicesActionMenu = "invoices:view-action-menu",
  RequestPaymentOnInvoices = "invoices:request-payment",

  // Payments
  SettleRepayment = "payments:settle-repayments",

  // Line of credit
  EditLineOfCredit = "line-of-credit:edit",

  // Vendor
  AddVendor = "vendor:add",
  EditVendor = "vendor:edit",
  ApproveVendor = "vendor:approve",
  AddVendorContact = "vendor:add-contact",
  EditVendorContact = "vendor:edit-contact",
  SendVendorAgreements = "vendor:send-agreements",

  // Payor
  AddPayor = "payor:add",
  EditPayor = "payor:edit",
  ApprovePayor = "payor:approve",
  AddPayorContact = "payor:add-contact",
  EditPayorContact = "payor:edit-contact",
  SendPayorAgreements = "payor:send-agreements",

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
  [UserRolesEnum.BankReadOnly]: Rule;
  [UserRolesEnum.CompanyAdmin]: Rule;
  [UserRolesEnum.CompanyReadOnly]: Rule;
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
  [UserRolesEnum.BankAdmin]: {
    static: [
      // Bank on-behalf-of actions - bank performs on behalf of customer.
      Action.AddPurchaseOrders,
      Action.EditPurchaseOrders,
      // Action.FundPurchaseOrders,

      Action.AddPurchaseOrderLoan,
      Action.EditPurchaseOrderLoan,
      Action.RepayPurchaseOrderLoans,

      // Bank actions.
      Action.AssignBespokeBankAccountForCustomer,
      Action.AddBankAccount,
      Action.EditBankAccount,
      Action.EditCustomerSettings,
      Action.EditTerms,
      Action.TerminateContract,

      Action.DisbursePurchaseOrderLoans,

      Action.ApproveLoan,
      Action.RejectLoan,
      Action.EditLoanInternalNote,
      Action.ViewLoanInternalNote,
      Action.SelectLoan,
      Action.DeselectLoan,
      Action.CreateAdvance,
      Action.RunBalances,

      Action.SettleRepayment,

      Action.EditUserAccountSettings,

      Action.AddVendor,
      Action.EditVendor,
      Action.ApproveVendor,
      Action.AddVendorContact,
      Action.EditVendorContact,
      Action.SendVendorAgreements,

      Action.AddPayor,
      Action.EditPayor,
      Action.ApprovePayor,
      Action.AddPayorContact,
      Action.EditPayorContact,
      Action.SendPayorAgreements,

      Action.ManipulateUser,
    ],
    dynamic: [
      {
        action: Action.ManipulateUser,
        condition: ({ currentUserId, userIdForCheck }: ActionData) =>
          currentUserId === userIdForCheck,
      },
    ],
  },
  [UserRolesEnum.BankReadOnly]: {
    static: [Action.ViewLoanInternalNote],
    dynamic: [],
  },
  [UserRolesEnum.CompanyAdmin]: {
    static: [
      Action.AddPurchaseOrders,
      Action.EditPurchaseOrders,
      Action.FundPurchaseOrders,

      Action.AddInvoices,
      Action.EditInvoices,
      Action.FundInvoices,
      Action.RequestPaymentOnInvoices,

      Action.AddPurchaseOrderLoan,
      Action.EditPurchaseOrderLoan,
      Action.RepayPurchaseOrderLoans,

      Action.SelectLoan,
      Action.DeselectLoan,

      Action.ManipulateUser,
      Action.ViewPurchaseOrdersActionMenu,
      Action.EditLineOfCredit,
    ],
    dynamic: [
      {
        action: Action.ManipulateUser,
        condition: ({ currentUserId, userIdForCheck }: ActionData) =>
          currentUserId === userIdForCheck,
      },
    ],
  },
  [UserRolesEnum.CompanyReadOnly]: {
    static: [],
    dynamic: [],
  },
};

export default rules;
