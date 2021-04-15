import {
  CompanyTypeEnum,
  LoanStatusEnum,
  LoanTypeEnum,
  ProductTypeEnum,
  RequestStatusEnum,
  UserRolesEnum,
} from "generated/graphql";
import InventoryContractTermsJson from "./contract_terms_inventory.json";
import InvoiceContractTermsJson from "./contract_terms_invoice.json";
import LineOfCreditContractTermsJson from "./contract_terms_line_of_credit.json";
import PMFContractTermsJson from "./contract_terms_purchase_money_financing.json";

// Action Type enum related.
export enum ActionType {
  New,
  Update,
  Copy,
}

export enum PaymentTypeEnum {
  Adjustment = "adjustment",
  Advance = "advance",
  Repayment = "repayment",
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
  [PaymentStatusEnum.PENDING]: "Payment Pending",
  [PaymentStatusEnum.SCHEDULED]: "Payment Scheduled",
  [PaymentStatusEnum.CLOSED]: "Closed",
};

// TODO(dlluncor): Remove references to PastDue, Funded, Closed as these are not valid statuses
// on the loan "request status"
// Loan Status enum related.
export const LoanStatusToLabel = {
  [LoanStatusEnum.Drafted]: "Draft",
  [LoanStatusEnum.ApprovalRequested]: "Pending Approval",
  [LoanStatusEnum.Approved]: "Approved",
  [LoanStatusEnum.Rejected]: "Changes Required",
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

// Payment methods that a Payor may pay with.
export const PayorPaymentMethods = [
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
  [ProductTypeEnum.PurchaseMoneyFinancing]: JSON.stringify(
    PMFContractTermsJson
  ),
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
  ProductTypeEnum.PurchaseMoneyFinancing,
];

// Request status enum related.
export const RequestStatusToLabel = {
  [RequestStatusEnum.Drafted]: "Draft",
  [RequestStatusEnum.ApprovalRequested]: "Pending Review",
  [RequestStatusEnum.Approved]: "Confirmed",
  [RequestStatusEnum.Rejected]: "Changes Required",
};

// User Role enum related.
export const UserRoleToLabel = {
  [UserRolesEnum.BankAdmin]: "Bank Admin",
  [UserRolesEnum.BankReadOnly]: "Bank User (View Only)",
  [UserRolesEnum.CompanyAdmin]: "Company Admin",
  [UserRolesEnum.CompanyReadOnly]: "Company User (View Only)",
};

// Mapping for when we look up loans based on ProductType
export const ProductTypeToLoanType = {
  [ProductTypeEnum.InventoryFinancing]: LoanTypeEnum.PurchaseOrder,
  [ProductTypeEnum.LineOfCredit]: LoanTypeEnum.LineOfCredit,
  [ProductTypeEnum.InvoiceFinancing]: LoanTypeEnum.Invoice,
  // PMF loans are associated with a purchase order and invoices are used to
  // repay those loans
  [ProductTypeEnum.PurchaseMoneyFinancing]: LoanTypeEnum.PurchaseOrder,
  // Give None a type so that we're exhaustive
  [ProductTypeEnum.None]: null,
};

export const CompanyTypeToDisplayLower = {
  [CompanyTypeEnum.Vendor]: "vendor",
  [CompanyTypeEnum.Payor]: "payor",
  [CompanyTypeEnum.Customer]: "customer",
};

export const CompanyTypeToDisplayUpper = {
  [CompanyTypeEnum.Vendor]: "Vendor",
  [CompanyTypeEnum.Payor]: "Payor",
  [CompanyTypeEnum.Customer]: "Customer",
};
