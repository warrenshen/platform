import { UserRolesEnum } from "generated/graphql";

// inspired by https://auth0.com/blog/role-based-access-control-rbac-and-react-apps/

export enum Action {
  // Bank Accounts
  AssignBespokeBankAccountForCustomer = "bank-accounts:assign-to-customer",
  AddBankAccount = "bank-accounts:add",
  EditBankAccount = "bank-accounts:edit",
  DeleteBankAccount = "bank-accounts:delete",
  EditCustomerSettings = "bank-accounts:edit-customer-settings",

  AddContract = "contracts:add",
  DeleteContract = "contract:delete",
  EditTerms = "contract:edit-terms",
  TerminateContract = "contract:terminate",

  // Loans
  ApproveLoan = "loans:approve",
  EditLoanInternalNote = "loans:edit-internal-note",
  RejectLoan = "loans:reject",
  ViewLoanInternalNote = "loans:view-internal-note",
  SelectLoan = "loans:select",
  DeselectLoan = "loans:deselect",
  DeleteLoans = "loans:delete",
  CreateAdvance = "loans:create-advance",
  RunBalances = "loans:run-balances",

  // Fees
  BookFees = "fees:book_fees",

  // Adjustments
  CreateAdjustment = "loans:create-adjustment",

  // Purchase Orders
  AddPurchaseOrders = "purchase-orders:add",
  ApprovePurchaseOrders = "purchase-orders:approve",
  EditPurchaseOrders = "purchase-orders:manipulate",
  DeletePurchaseOrders = "purchase-orders:delete",
  FundPurchaseOrders = "purchase-orders:fund",
  ViewPurchaseOrdersActionMenu = "purchase-orders:view-action-menu",
  ClosePurchaseOrders = "purchase-orders:close",
  ReopenPurchaseOrders = "purchase-orders:reopen",

  // Purchase Order Loans
  AddPurchaseOrderLoan = "purchase-order-loan:add",
  DisbursePurchaseOrderLoans = "purchase-order-loans:disburse",
  EditPurchaseOrderLoan = "purchase-order-loan:edit",
  RepayPurchaseOrderLoans = "purchase-order-loans:repay",

  // Invoices
  AddInvoices = "invoices:add",
  ApproveInvoices = "invoices:approve",
  EditInvoices = "invoices:add",
  FundInvoices = "invoices:fund",
  ViewInvoicesActionMenu = "invoices:view-action-menu",
  RequestPaymentOnInvoices = "invoices:request-payment",
  DeleteInvoices = "invoices:delete",

  // Payments
  DeleteRepayments = "payments:delete-repayments",
  SettleRepayment = "payments:settle-repayments",

  // Line of credit
  EditLineOfCredit = "line-of-credit:edit",

  // Borrowing base
  AddBorrowingBase = "borrowing-base:add",

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

  // Catch-all for whether the person is a bank admin
  IsBankAdmin = "perm:is_bank_admin",

  // Reports
  KickoffMonthlySummaryEmails = "reports:generate",

  // Debt Facility
  AddDebtFacility = "debt_facility:add_facility",
  UpdateDebtFacility = "debt_facility:update_facility",
  UpdateCompanyDebtFacilityStatus = "debt_facility:update_company_status",
  MoveDebtFacilityLoan = "debt_facility:move_loan",
  ResolveDebtFacilityLoan = "debt_facility:resolve_loan",
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
  [UserRolesEnum.CompanyContactOnly]: Rule;
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

      Action.AddBorrowingBase,

      Action.CreateAdjustment,
      Action.BookFees,

      // Bank on-behalf-of customer actions - bank performs on behalf of customer.
      Action.AddPurchaseOrders,
      Action.EditPurchaseOrders,
      Action.DeletePurchaseOrders,
      Action.FundPurchaseOrders,
      Action.ClosePurchaseOrders,
      Action.ReopenPurchaseOrders,

      Action.AddInvoices,
      Action.ApproveInvoices,
      Action.EditInvoices,
      Action.DeleteInvoices,
      Action.FundInvoices,
      // Action.RequestPaymentOnInvoices,

      Action.AddPurchaseOrderLoan,
      Action.EditPurchaseOrderLoan,
      Action.RepayPurchaseOrderLoans,
      Action.DeleteLoans,

      // Bank on-behalf-of vendor actions - bank performs on behalf of vendor.
      Action.ApprovePurchaseOrders,

      // Bank actions.
      Action.AssignBespokeBankAccountForCustomer,
      Action.AddBankAccount,
      Action.EditBankAccount,
      Action.DeleteBankAccount,
      Action.EditCustomerSettings,

      Action.AddContract,
      Action.DeleteContract,
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

      Action.DeleteRepayments,
      Action.SettleRepayment,

      Action.EditUserAccountSettings,

      Action.ManipulateUser,

      Action.IsBankAdmin,

      Action.KickoffMonthlySummaryEmails,

      Action.AddDebtFacility,
      Action.UpdateDebtFacility,
      Action.UpdateCompanyDebtFacilityStatus,
      Action.MoveDebtFacilityLoan,
      Action.ResolveDebtFacilityLoan,
    ],
    dynamic: [],
  },
  [UserRolesEnum.BankReadOnly]: {
    static: [Action.ViewLoanInternalNote],
    dynamic: [],
  },
  [UserRolesEnum.CompanyAdmin]: {
    static: [
      Action.AddBankAccount,
      Action.EditBankAccount,

      Action.AddPayor,
      Action.AddVendor,

      Action.AddBorrowingBase,

      Action.AddPurchaseOrders,
      Action.EditPurchaseOrders,
      Action.DeletePurchaseOrders,
      Action.FundPurchaseOrders,
      Action.ClosePurchaseOrders,
      Action.ReopenPurchaseOrders,

      Action.AddInvoices,
      Action.EditInvoices,
      Action.FundInvoices,
      Action.RequestPaymentOnInvoices,

      Action.AddPurchaseOrderLoan,
      Action.EditPurchaseOrderLoan,
      Action.RepayPurchaseOrderLoans,
      Action.DeleteLoans,

      Action.SelectLoan,
      Action.DeselectLoan,

      Action.ManipulateUser,
      Action.ViewPurchaseOrdersActionMenu,
      Action.EditLineOfCredit,
    ],
    dynamic: [],
  },
  [UserRolesEnum.CompanyReadOnly]: {
    static: [],
    dynamic: [],
  },
  [UserRolesEnum.CompanyContactOnly]: {
    static: [],
    dynamic: [],
  },
};

export default rules;
