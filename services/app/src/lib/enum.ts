import {
  CompanyTypeEnum,
  LoanTypeEnum,
  RequestStatusEnum,
  UserRolesEnum,
} from "generated/graphql";
import DispensaryContractTermsJson from "./contract_terms_dispensary.json";
import InventoryContractTermsJson from "./contract_terms_inventory.json";
import InvoiceContractTermsJson from "./contract_terms_invoice.json";
import LineOfCreditContractTermsJson from "./contract_terms_line_of_credit.json";
import PMFContractTermsJson from "./contract_terms_purchase_money.json";

// Action Type enum related.
export enum ActionType {
  New,
  Update,
  Copy,
}

export enum UUIDEnum {
  None = "00000000-0000-0000-0000-000000000000",
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
  FeeWaiver = "fee_waiver",
  PayoutUserCreditToCustomer = "payout_user_credit_to_customer",
  Repayment = "repayment",
  RepaymentOfAccountFee = "repayment_account_fee",
}

export enum BankPurchaseOrdersTabLabel {
  IncompletePOs = "Incomplete POs",
  NotConfirmedPOs = "Not Confirmed POs",
  ConfirmedPOs = "Confirmed POs",
  AllPOs = "All POs",
}

export const BankPurchaseOrdersTabLabels = [
  BankPurchaseOrdersTabLabel.IncompletePOs,
  BankPurchaseOrdersTabLabel.NotConfirmedPOs,
  BankPurchaseOrdersTabLabel.ConfirmedPOs,
  BankPurchaseOrdersTabLabel.AllPOs,
];

export enum CustomerPurchaseOrdersTabLabel {
  ActivePOs = "Active POs",
  ClosedPOs = "Closed POs",
}

export const CustomerPurchaseOrdersTabLabels = [
  CustomerPurchaseOrdersTabLabel.ActivePOs,
  CustomerPurchaseOrdersTabLabel.ClosedPOs,
];

export const PaymentTypeToLabel = {
  [PaymentTypeEnum.Adjustment]: "Adjustment",
  [PaymentTypeEnum.Advance]: "Advance",
  [PaymentTypeEnum.CreditToUser]: "Credit To Borrower",
  [PaymentTypeEnum.Fee]: "Account Fee",
  [PaymentTypeEnum.FeeWaiver]: "Account Fee Waiver",
  [PaymentTypeEnum.PayoutUserCreditToCustomer]: "Payout To Borrower",
  [PaymentTypeEnum.Repayment]: "Repayment",
  [PaymentTypeEnum.RepaymentOfAccountFee]: "Repayment",
};

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

// Transaction sub type enum related.
export enum TransactionSubTypeEnum {
  CustomFee = "custom_fee",
  MinimumInterestFee = "minimum_interest_fee",
  WireFee = "wire_fee",
}

export const TransactionSubTypeToLabel = {
  [TransactionSubTypeEnum.CustomFee]: "Custom Fee",
  [TransactionSubTypeEnum.MinimumInterestFee]: "Minimum Interest Fee",
  [TransactionSubTypeEnum.WireFee]: "Wire Fee",
};

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
export enum ProductTypeEnum {
  DispensaryFinancing = "dispensary_financing",
  InventoryFinancing = "inventory_financing",
  InvoiceFinancing = "invoice_financing",
  LineOfCredit = "line_of_credit",
  PurchaseMoneyFinancing = "purchase_money_financing",
  None = "none",
}

export const ProductTypeToContractTermsJson = {
  [ProductTypeEnum.DispensaryFinancing]: JSON.stringify(
    DispensaryContractTermsJson
  ),
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
  [ProductTypeEnum.DispensaryFinancing]: "Dispensary Financing",
  [ProductTypeEnum.InventoryFinancing]: "Inventory Financing",
  [ProductTypeEnum.InvoiceFinancing]: "Invoice Financing",
  [ProductTypeEnum.LineOfCredit]: "Line of Credit",
  [ProductTypeEnum.PurchaseMoneyFinancing]: "Purchase Money Financing",
  [ProductTypeEnum.None]: "None",
};

// List of all supported product types, note that we do NOT include "None".
export const AllProductTypes = [
  ProductTypeEnum.DispensaryFinancing,
  ProductTypeEnum.InventoryFinancing,
  ProductTypeEnum.InvoiceFinancing,
  ProductTypeEnum.LineOfCredit,
  ProductTypeEnum.PurchaseMoneyFinancing,
];

// Request status enum related.
export const RequestStatusToLabel = {
  [RequestStatusEnum.Drafted]: "Draft",
  [RequestStatusEnum.ApprovalRequested]: "Pending Review",
  [RequestStatusEnum.Incomplete]: "Changes Required",
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
  [ProductTypeEnum.DispensaryFinancing]: LoanTypeEnum.PurchaseOrder,
  [ProductTypeEnum.InventoryFinancing]: LoanTypeEnum.PurchaseOrder,
  [ProductTypeEnum.InvoiceFinancing]: LoanTypeEnum.Invoice,
  [ProductTypeEnum.LineOfCredit]: LoanTypeEnum.LineOfCredit,
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

export const FeeWaiverTypeToLabel = {
  [FeeTypeEnum.MinimumInterestFee]: "Minimum Interest Fee Waiver",
  [FeeTypeEnum.WireFee]: "Wire Fee Waiver",
  [FeeTypeEnum.CustomFee]: "Custom Fee Waiver",
};

export const AllFeeWaiverTypes = [
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

export enum PartnerEnum {
  VENDOR = "Vendor",
  PAYOR = "Payor",
  BOTH = "Vendor / Payor",
}

// Debt Facility Loan Status

export enum DebtFacilityStatusEnum {
  SOLD_INTO_DEBT_FACILITY = "sold_into_debt_facility",
  BESPOKE_BALANCE_SHEET = "bespoke_balance_sheet",
  REPURCHASED = "repurchased",
  UPDATE_REQUIRED = "update_required",
  WAIVER = "waiver",
}

export const DebtFacilityStatusToLabel = {
  [DebtFacilityStatusEnum.SOLD_INTO_DEBT_FACILITY]: "Debt Facility",
  [DebtFacilityStatusEnum.BESPOKE_BALANCE_SHEET]: "Bespoke",
  [DebtFacilityStatusEnum.REPURCHASED]: "Repurchased",
  [DebtFacilityStatusEnum.UPDATE_REQUIRED]: "Update Required",
  [DebtFacilityStatusEnum.WAIVER]: "Waiver",
};

/*
  Company Debt Facility status supercedes loan debt facility status
  i.e. If a company is ineligible, then that supercedes whether or not
  a specific loan can be sold into the debt facility
  Caveat: If there is a waiver, it is eligible regardless
*/
export const DebtFacilityStatusToEligibility = {
  [DebtFacilityStatusEnum.SOLD_INTO_DEBT_FACILITY]: "Eligible",
  [DebtFacilityStatusEnum.BESPOKE_BALANCE_SHEET]: "Eligible",
  // Repurchased is for when  company goes from good standing to bad standing
  // If/when a company reverses and is in good standing again, remaining open loans should
  // be automatically changed to the bespoke balance sheet status
  [DebtFacilityStatusEnum.REPURCHASED]: "Ineligible",
  [DebtFacilityStatusEnum.UPDATE_REQUIRED]: "Ineligible",
  [DebtFacilityStatusEnum.WAIVER]: "Waiver",
};

// Debt Facility Company Status

export enum DebtFacilityCompanyStatusEnum {
  GOOD_STANDING = "good_standing",
  ON_PROBATION = "on_probation",
  OUT_OF_COMPLIANCE = "out_of_compliance",
  DEFAULTING = "defaulting",
  // must be default state for dispensary financing clients
  INELIGIBLE_FOR_FACILITY = "ineligible_for_facility",
  WAIVER = "waiver",
}

export const DebtFacilityCompanyStatusToLabel = {
  [DebtFacilityCompanyStatusEnum.GOOD_STANDING]: "Good Standing",
  [DebtFacilityCompanyStatusEnum.ON_PROBATION]: "On Probation",
  [DebtFacilityCompanyStatusEnum.OUT_OF_COMPLIANCE]: "Out of Compliance",
  [DebtFacilityCompanyStatusEnum.DEFAULTING]: "Defaulting",
  [DebtFacilityCompanyStatusEnum.INELIGIBLE_FOR_FACILITY]:
    "Ineligible for Facility",
  [DebtFacilityCompanyStatusEnum.WAIVER]: "Waiver",
};

/* 
Splitting this out because while we have multiple "bad" states, that summarizes
to less buckets for the report we send to the debt facility. However, the mutliple
bad states is still useful for internal purposes
*/
export const DebtFacilityCompanyStatusToEligibility = {
  [DebtFacilityCompanyStatusEnum.GOOD_STANDING]: "Eligible",
  [DebtFacilityCompanyStatusEnum.ON_PROBATION]: "Ineligible",
  [DebtFacilityCompanyStatusEnum.OUT_OF_COMPLIANCE]: "Ineligible",
  [DebtFacilityCompanyStatusEnum.DEFAULTING]: "Ineligible",
  [DebtFacilityCompanyStatusEnum.INELIGIBLE_FOR_FACILITY]: "Ineligible",
  [DebtFacilityCompanyStatusEnum.WAIVER]: "Waiver",
};

export enum DebtFacilityTabLabel {
  Open = "Open",
  ActionRequired = "Action Required",
  All = "All",
  Report = "Report",
  Admin = "Admin",
}

export type DebtFacilityTabLabelType =
  | typeof DebtFacilityTabLabel.Open
  | typeof DebtFacilityTabLabel.ActionRequired
  | typeof DebtFacilityTabLabel.All
  | typeof DebtFacilityTabLabel.Report
  | typeof DebtFacilityTabLabel.Admin;

export const DebtFacilityTabLabels: DebtFacilityTabLabelType[] = [
  DebtFacilityTabLabel.Open,
  DebtFacilityTabLabel.ActionRequired,
  DebtFacilityTabLabel.All,
  DebtFacilityTabLabel.Report,
  DebtFacilityTabLabel.Admin,
];

export enum MetrcTabLabel {
  MetrcApiKeys = "Metrc Api Keys",
  MetrcTransfers = "Metrc Transfers",
  MetrcPackages = "Metrc Packages",
  CannabisLicenses = "Cannabis Licenses",
}

export type TabLabel =
  | typeof MetrcTabLabel.MetrcApiKeys
  | typeof MetrcTabLabel.MetrcTransfers
  | typeof MetrcTabLabel.MetrcPackages
  | typeof MetrcTabLabel.CannabisLicenses;

export const tabLabels: TabLabel[] = [
  MetrcTabLabel.MetrcApiKeys,
  MetrcTabLabel.MetrcTransfers,
  MetrcTabLabel.MetrcPackages,
  MetrcTabLabel.CannabisLicenses,
];
