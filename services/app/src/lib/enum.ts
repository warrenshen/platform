import {
  LoanStatusEnum,
  LoanTypeEnum,
  ProductTypeEnum,
  RequestStatusEnum,
  UserRolesEnum,
} from "generated/graphql";
import InventoryContractTermsJson from "./inventory_contract_terms.json";
import InvoiceContractTermsJson from "./invoice_contract_terms.json";
import LineOfCreditContractTermsJson from "./line_of_credit_contract_terms.json";

// Action Type enum related.
export enum ActionType {
  New,
  Update,
  Copy,
}

export enum PaymentStatusEnum {
  PARTIALLY_PAID = "partially_paid",
  PENDING = "pending",
  SCHEDULED = "scheduled",
  CLOSED = "closed",
}

// PaymentStatus internal name to label
export const PaymentStatusToLabel = {
  [PaymentStatusEnum.PARTIALLY_PAID]: "Partially Paid",
  [PaymentStatusEnum.PENDING]: "Pending",
  [PaymentStatusEnum.SCHEDULED]: "Scheduled",
  [PaymentStatusEnum.CLOSED]: "Closed",
};

// TODO(dlluncor): Remove references to PastDue, Funded, Closed as these are not valid statuses
// on the loan "request status"
// Loan Status enum related.
export const LoanStatusToLabel = {
  [LoanStatusEnum.Drafted]: "Drafted",
  [LoanStatusEnum.ApprovalRequested]: "Requested",
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
  [LoanTypeEnum.Invoice]: "Invoice",
};

// Payment Method enum related.
export enum PaymentMethodEnum {
  ACH = "ach",
  ReverseDraftACH = "reverse_draft_ach",
  Wire = "wire",
  Check = "check",
  Cash = "cash",
}

export const PaymentMethodToLabel = {
  [PaymentMethodEnum.ACH]: "ACH",
  [PaymentMethodEnum.ReverseDraftACH]: "Reverse Draft ACH",
  [PaymentMethodEnum.Wire]: "Wire",
  [PaymentMethodEnum.Check]: "Check",
  [PaymentMethodEnum.Cash]: "Cash",
};

export const AllPaymentMethods = [
  PaymentMethodEnum.ReverseDraftACH,
  PaymentMethodEnum.ACH,
  PaymentMethodEnum.Wire,
  PaymentMethodEnum.Cash,
  PaymentMethodEnum.Check,
];

// Payment Option enum related.
export enum PaymentOptionEnum {
  InFull = "pay_in_full",
  MinimumDue = "pay_minimum_due",
  CustomAmount = "custom_amount",
}

export const AllPaymentOptions = [
  PaymentOptionEnum.InFull,
  PaymentOptionEnum.MinimumDue,
  PaymentOptionEnum.CustomAmount,
];

export const PaymentOptionToLabel = {
  [PaymentOptionEnum.InFull]: "Pay in full",
  [PaymentOptionEnum.MinimumDue]: "Pay minimum due",
  [PaymentOptionEnum.CustomAmount]: "Pay custom amount",
};

// Product Type enum related.
export const ProductTypeToContractTermsJson = {
  [ProductTypeEnum.InventoryFinancing]: JSON.stringify(
    InventoryContractTermsJson
  ),
  [ProductTypeEnum.InvoiceFinancing]: JSON.stringify(InvoiceContractTermsJson),
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
  // TODO(warren): Hiding these for now because things blow up when we allow a user to select it.
  // ProductTypeEnum.PurchaseMoneyFinancing,
];

// Request status enum related.
export const RequestStatusToLabel = {
  [RequestStatusEnum.Drafted]: "Drafted",
  [RequestStatusEnum.ApprovalRequested]: "Requested",
  [RequestStatusEnum.Approved]: "Confirmed",
  [RequestStatusEnum.Rejected]: "Rejected",
};

// User Role enum related.
export const UserRoleToLabel = {
  [UserRolesEnum.BankAdmin]: "Bank Admin",
  [UserRolesEnum.BankReadOnly]: "Bank User (View Only)",
  [UserRolesEnum.CompanyAdmin]: "Company Admin",
  [UserRolesEnum.CompanyReadOnly]: "Company User (View Only)",
};
