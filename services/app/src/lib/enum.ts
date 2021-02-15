import {
  LoanStatusEnum,
  LoanTypeEnum,
  ProductTypeEnum,
  RequestStatusEnum,
  UserRolesEnum,
} from "generated/graphql";
import InventoryContractTermsJson from "./inventory_contract_terms.json";
import LineOfCreditContractTermsJson from "./line_of_credit_contract_terms.json";

// Action Type enum related.
export enum ActionType {
  New,
  Update,
  Copy,
}

// Loan Status enum related.
export const LoanStatusToLabel = {
  [LoanStatusEnum.Drafted]: "Drafted",
  [LoanStatusEnum.ApprovalRequested]: "Approval Requested",
  [LoanStatusEnum.Approved]: "Approved",
  [LoanStatusEnum.Rejected]: "Rejected",
  [LoanStatusEnum.PastDue]: "Past Due",
  [LoanStatusEnum.Funded]: "Funded",
  [LoanStatusEnum.Closed]: "Closed",
};

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
export const ProductTypeToContractTermsJson = {
  [ProductTypeEnum.InventoryFinancing]: JSON.stringify(
    InventoryContractTermsJson
  ),
  [ProductTypeEnum.InvoiceFinancing]: JSON.stringify({}),
  [ProductTypeEnum.LineOfCredit]: JSON.stringify(LineOfCreditContractTermsJson),
  [ProductTypeEnum.PurchaseMoneyFinancing]: JSON.stringify({}),
  [ProductTypeEnum.None]: JSON.stringify({}),
};

export const ProductTypeToLabel = {
  [ProductTypeEnum.InventoryFinancing]: "Inventory Financing",
  [ProductTypeEnum.InvoiceFinancing]: "Invoice Financing",
  [ProductTypeEnum.LineOfCredit]: "Line of Credit",
  [ProductTypeEnum.PurchaseMoneyFinancing]: "Purchase Money Financing",
  [ProductTypeEnum.None]: "None",
};

// List of all supported product types, note that we do NOT include "None".
export const AllProductTypes = [
  ProductTypeEnum.InventoryFinancing,
  ProductTypeEnum.LineOfCredit,
  ProductTypeEnum.InvoiceFinancing,
  ProductTypeEnum.PurchaseMoneyFinancing,
];

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
