import {
  LoanStatusEnum,
  LoanTypeEnum,
  ProductTypeEnum,
  RequestStatusEnum,
  UserRolesEnum,
} from "generated/graphql";

// Loan Status enum related.
export const AllLoanStatuses = [
  LoanStatusEnum.ApprovalRequested,
  LoanStatusEnum.Approved,
  LoanStatusEnum.Closed,
  LoanStatusEnum.Drafted,
  LoanStatusEnum.Funded,
  LoanStatusEnum.PastDue,
  LoanStatusEnum.Rejected,
];

// Loan Type enum related.
export const LoanTypeToLabel = {
  [LoanTypeEnum.LineOfCredit]: "Line of Credit",
  [LoanTypeEnum.PurchaseOrder]: "Purchase Order",
};

// Payment Method enum related.
export enum PaymentMethodEnum {
  ACH = "ach",
  ReverseDraftACH = "reverse_draft_ach",
  Wire = "wire",
  Check = "check",
  Cash = "cash",
  None = "none",
}

export const PaymentMethodToLabel = {
  [PaymentMethodEnum.ACH]: "ACH",
  [PaymentMethodEnum.ReverseDraftACH]: "Reverse Draft ACH",
  [PaymentMethodEnum.Wire]: "Wire",
  [PaymentMethodEnum.Check]: "Check",
  [PaymentMethodEnum.Cash]: "Cash",
  [PaymentMethodEnum.None]: "None",
};

export const AllPaymentMethods = [
  PaymentMethodEnum.None,
  PaymentMethodEnum.ACH,
  PaymentMethodEnum.ReverseDraftACH,
  PaymentMethodEnum.Wire,
  PaymentMethodEnum.Cash,
  PaymentMethodEnum.Check,
];

// Product Type enum related.
export const ProductTypeToLabel = {
  [ProductTypeEnum.InventoryFinancing]: "Inventory Financing",
  [ProductTypeEnum.InvoiceFinancing]: "Invoice Financing",
  [ProductTypeEnum.LineOfCredit]: "Line of Credit",
  [ProductTypeEnum.PurchaseMoneyFinancing]: "Purchase Money Financing",
  [ProductTypeEnum.None]: "None",
};

// Request status enum related.
export const RequestStatusToLabel = {
  [RequestStatusEnum.Drafted]: "Drafted",
  [RequestStatusEnum.ApprovalRequested]: "Approval Requested",
  [RequestStatusEnum.Approved]: "Approved",
  [RequestStatusEnum.Rejected]: "Rejected",
};

// User Role enum related.
export const UserRoleToLabel = {
  [UserRolesEnum.BankAdmin]: "Bank Admin",
  [UserRolesEnum.CompanyAdmin]: "Company Admin",
};
