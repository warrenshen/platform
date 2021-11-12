import {
  CompanyTypeEnum,
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

// File type enum is used for permissions when accessing files.
// We need to know from which file table the user is intending to read from.
export enum FileTypeEnum {
  COMPANY_AGREEMENT = "company_agreement",
  COMPANY_LICENSE = "company_license",
  EBBA_APPLICATION = "ebba_application",
  INVOICE = "invoice",
  PAYOR_AGREEMENT = "payor_agreement",
  PAYOR_LICENSE = "payor_license",
  PURCHASE_ORDER = "purchase_order",
  VENDOR_AGREEMENT = "vendor_agreement",
  VENDOR_LICENSE = "vendor_license",
}

export enum PaymentTypeEnum {
  Adjustment = "adjustment",
  Advance = "advance",
  CreditToUser = "credit_to_user",
  Fee = "fee",
  PayoutUserCreditToCustomer = "payout_user_credit_to_customer",
  Repayment = "repayment",
  RepaymentOfAccountFee = "repayment_account_fee",
}

export enum PaymentStatusEnum {
  // Awaiting submit by bank user.
  AwaitingSubmit = "awaiting_submit",
  // Awaiting settle by bank user.
  AwaitingSettlement = "awaiting_settlement",
  Settled = "settled",
  Reversed = "reversed",
  Deleted = "deleted",
}

export const PaymentStatusToLabel = {
  [PaymentStatusEnum.AwaitingSubmit]: "Awaiting Submission",
  [PaymentStatusEnum.AwaitingSettlement]: "Awaiting Settlement",
  [PaymentStatusEnum.Settled]: "Settled",
  [PaymentStatusEnum.Reversed]: "Reversed",
  [PaymentStatusEnum.Deleted]: "Deleted",
};

export enum LoanPaymentStatusEnum {
  PARTIALLY_PAID = "partially_paid",
  PENDING = "pending",
  SCHEDULED = "scheduled",
  CLOSED = "closed",
}

// PaymentStatus internal name to label
export const LoanPaymentStatusToLabel = {
  [LoanPaymentStatusEnum.PARTIALLY_PAID]: "Partially Paid",
  [LoanPaymentStatusEnum.PENDING]: "Payment Pending",
  [LoanPaymentStatusEnum.SCHEDULED]: "Payment Scheduled",
  [LoanPaymentStatusEnum.CLOSED]: "Closed",
};

export enum LoanStatusEnum {
  Drafted = "drafted",
  ApprovalRequested = "approval_requested",
  Approved = "approved",
  Rejected = "rejected",
  Funded = "funded",
  PastDue = "past_due",
  Closed = "closed",
  Closing = "closing",
}

// TODO(dlluncor): Remove references to PastDue, Funded, Closed
// as these are not valid statuses on the loan "request status"
// Loan Status enum related.
export const LoanStatusToLabel = {
  [LoanStatusEnum.Drafted]: "Draft",
  [LoanStatusEnum.ApprovalRequested]: "Pending Approval",
  [LoanStatusEnum.Approved]: "Approved",
  [LoanStatusEnum.Rejected]: "Changes Required",
  [LoanStatusEnum.PastDue]: "Past Due",
  [LoanStatusEnum.Funded]: "Funded",
  [LoanStatusEnum.Closed]: "Closed",
  [LoanStatusEnum.Closing]: "Closing",
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
  Unknown = "unknown",
}

export const PaymentMethodToLabel = {
  [PaymentMethodEnum.ACH]: "ACH",
  [PaymentMethodEnum.ReverseDraftACH]: "Reverse Draft ACH",
  [PaymentMethodEnum.Wire]: "Wire",
  [PaymentMethodEnum.Check]: "Check",
  [PaymentMethodEnum.Cash]: "Cash",
  [PaymentMethodEnum.Unknown]: "Unknown",
};

export const AllPaymentMethods = [
  PaymentMethodEnum.ReverseDraftACH,
  PaymentMethodEnum.ACH,
  PaymentMethodEnum.Wire,
  PaymentMethodEnum.Cash,
  PaymentMethodEnum.Check,
];

// Payment methods that bank (Bespoke Financial) may pay with.
export const BankPaymentMethods = [
  PaymentMethodEnum.ACH,
  PaymentMethodEnum.Wire,
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
  Unknown = "unknown",
}

export const CustomerPaymentOptions = [
  PaymentOptionEnum.InFull,
  PaymentOptionEnum.MinimumDue,
  PaymentOptionEnum.CustomAmount,
];

export const PaymentOptionToLabel = {
  [PaymentOptionEnum.InFull]: "Pay in full",
  [PaymentOptionEnum.MinimumDue]: "Pay minimum due",
  [PaymentOptionEnum.CustomAmount]: "Pay custom amount",
  [PaymentMethodEnum.Unknown]: "Unknown",
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
  ProductTypeEnum.LineOfCredit,
  ProductTypeEnum.InventoryFinancing,
  ProductTypeEnum.InvoiceFinancing,
  ProductTypeEnum.PurchaseMoneyFinancing,
];

// Request status enum related.
export const RequestStatusToLabel = {
  [RequestStatusEnum.Drafted]: "Draft",
  [RequestStatusEnum.ApprovalRequested]: "Pending Review",
  [RequestStatusEnum.Approved]: "Confirmed",
  [RequestStatusEnum.Rejected]: "Action Required",
};

// Request status enum related.
export const EbbaApplicationStatusToLabel = {
  [RequestStatusEnum.Drafted]: "Draft",
  [RequestStatusEnum.ApprovalRequested]: "Pending Review",
  [RequestStatusEnum.Approved]: "Accepted",
  [RequestStatusEnum.Rejected]: "Action Required",
};

// User Role enum related.
export const UserRoleToLabel = {
  [UserRolesEnum.BankAdmin]: "Bank Admin",
  [UserRolesEnum.BankReadOnly]: "Bank User (View Only)",
  [UserRolesEnum.CompanyAdmin]: "Company Admin",
  [UserRolesEnum.CompanyReadOnly]: "Company User (View Only)",
  [UserRolesEnum.CompanyContactOnly]: "Company Contact (No Account)",
};

export const BankUserRoles = [
  UserRolesEnum.BankAdmin,
  UserRolesEnum.BankReadOnly,
];

export const CompanyUserRoles = [
  UserRolesEnum.CompanyAdmin,
  UserRolesEnum.CompanyReadOnly,
  UserRolesEnum.CompanyContactOnly,
];

export const CustomerUserRoles = [
  UserRolesEnum.CompanyAdmin,
  UserRolesEnum.CompanyReadOnly,
];

export const PartnerCompanyUserRoles = [UserRolesEnum.CompanyContactOnly];

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

export enum TwoFactorMessageMethodEnum {
  Email = "email",
  Phone = "phone",
}

export const TwoFactorMessageMethodToLabel = {
  [TwoFactorMessageMethodEnum.Email]: "Email",
  [TwoFactorMessageMethodEnum.Phone]: "Phone",
};

export const AllTwoFactorMessageMethods = [
  TwoFactorMessageMethodEnum.Email,
  TwoFactorMessageMethodEnum.Phone,
];

export enum FeeTypeEnum {
  CustomFee = "custom_fee",
  MinimumInterestFee = "minimum_interest_fee",
  WireFee = "wire_fee",
}

export const FeeTypeToLabel = {
  [FeeTypeEnum.MinimumInterestFee]: "Minimum Interest Fee",
  [FeeTypeEnum.WireFee]: "Wire Fee",
  [FeeTypeEnum.CustomFee]: "Custom Fee",
};

export const AllFeeTypes = [
  FeeTypeEnum.MinimumInterestFee,
  FeeTypeEnum.WireFee,
  FeeTypeEnum.CustomFee,
];

export enum FeatureFlagEnum {
  CREATE_PURCHASE_ORDER_FROM_METRC_TRANSFERS = "create_purchase_order_from_metrc_transfers",
}

export const AllFeatureFlags = [
  FeatureFlagEnum.CREATE_PURCHASE_ORDER_FROM_METRC_TRANSFERS,
];

export enum CustomMessageEnum {
  OVERVIEW_PAGE = "overview_page",
}

export const AllCustomMessages = [CustomMessageEnum.OVERVIEW_PAGE];

export enum ClientSurveillanceCategoryEnum {
  BorrowingBase = "borrowing_base",
  FinancialReports = "financial_reports",
}

export enum MetrcDownloadSummaryStatusEnum {
  BespokeServerError = "bespoke_server_error",
  MetrcServerError = "metrc_server_error",
  NoAccess = "no_access",
  Success = "success",
}
