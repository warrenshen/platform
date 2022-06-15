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
  CompnayAgreement = "company_license",
  CompanyLicense = "company_license",
  EbbaApplication = "ebba_application",
  Invoice = "invoice",
  PayorAgreement = "payor_agreement",
  PayorLicense = "payor_license",
  PurchaseOrder = "purchase_order",
  VendorAgreement = "vendor_agreement",
  VendorLicense = "vendor_license",
  BankInstructions = "bank_instructions",
}

export interface USStateEnumInstance {
  abbreviation: string;
  full: string;
}

export interface USStateEnum {
  [key: string]: USStateEnumInstance;
}

export const USStates: USStateEnum = {
  None: { abbreviation: "", full: "None" },
  AL: { abbreviation: "AL", full: "Alabama" },
  AK: { abbreviation: "AK", full: "Alaska" },
  AZ: { abbreviation: "AZ", full: "Arizona" },
  AR: { abbreviation: "AR", full: "Arkansas" },
  CA: { abbreviation: "CA", full: "California" },
  CO: { abbreviation: "CO", full: "Colorado" },
  CT: { abbreviation: "CT", full: "Connecticut" },
  DE: { abbreviation: "DE", full: "Delaware" },
  DC: { abbreviation: "DC", full: "District of Columbia" },
  FL: { abbreviation: "FL", full: "Florida" },
  GA: { abbreviation: "GA", full: "Georgia" },
  HI: { abbreviation: "HI", full: "Hawaii" },
  ID: { abbreviation: "ID", full: "Idaho" },
  IL: { abbreviation: "IL", full: "Illinois" },
  IN: { abbreviation: "IN", full: "Indiana" },
  IA: { abbreviation: "IA", full: "Iowa" },
  KS: { abbreviation: "KS", full: "Kansas" },
  KY: { abbreviation: "KY", full: "Kentucky" },
  LA: { abbreviation: "LA", full: "Louisiana" },
  ME: { abbreviation: "ME", full: "Maine" },
  MD: { abbreviation: "MD", full: "Maryland" },
  MA: { abbreviation: "MA", full: "Massachusetts" },
  MI: { abbreviation: "MI", full: "Michigan" },
  MN: { abbreviation: "MN", full: "Minnesota" },
  MS: { abbreviation: "MS", full: "Mississippi" },
  MO: { abbreviation: "MO", full: "Missouri" },
  MT: { abbreviation: "MT", full: "Montana" },
  NE: { abbreviation: "NE", full: "Nebraska" },
  NV: { abbreviation: "NV", full: "Nevada" },
  NH: { abbreviation: "NH", full: "New Hampshire" },
  NJ: { abbreviation: "NJ", full: "New Jersey" },
  NM: { abbreviation: "NM", full: "New Mexico" },
  NY: { abbreviation: "NY", full: "New York" },
  NC: { abbreviation: "NC", full: "North Carolina" },
  ND: { abbreviation: "ND", full: "North Dakota" },
  OH: { abbreviation: "OH", full: "Ohio" },
  OK: { abbreviation: "OK", full: "Oklahoma" },
  OR: { abbreviation: "OR", full: "Oregon" },
  PA: { abbreviation: "PA", full: "Pennsylvania" },
  RI: { abbreviation: "RI", full: "Rhode Island" },
  SC: { abbreviation: "SC", full: "South Carolina" },
  SD: { abbreviation: "SD", full: "South Dakota" },
  TN: { abbreviation: "TN", full: "Tennessee" },
  TX: { abbreviation: "TX", full: "Texas" },
  UT: { abbreviation: "UT", full: "Utah" },
  VT: { abbreviation: "VT", full: "Vermont" },
  VA: { abbreviation: "VA", full: "Virginia" },
  WA: { abbreviation: "WA", full: "Washington" },
  WV: { abbreviation: "WV", full: "West Virginia" },
  WI: { abbreviation: "WI", full: "Wisconsin" },
  WY: { abbreviation: "WY", full: "Wyoming" },
};

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

export enum BankRepaymentsTabLabel {
  ActionRequired = "Action Required",
  ByDepositDate = "By Deposit Date",
  TpExportACHS = "TP Export - ACHs",
  All = "All",
}

export const BankRepaymentsTabLabels = [
  BankRepaymentsTabLabel.ActionRequired,
  BankRepaymentsTabLabel.ByDepositDate,
  BankRepaymentsTabLabel.TpExportACHS,
  BankRepaymentsTabLabel.All,
];

export enum BankLoansTabLabel {
  ActionRequired = "Action Required",
  MaturingSoon = "Maturing Soon",
  PastDue = "Past Due",
  All = "All",
}

export const BankLoansTabLabels = [
  BankLoansTabLabel.ActionRequired,
  BankLoansTabLabel.MaturingSoon,
  BankLoansTabLabel.PastDue,
  BankLoansTabLabel.All,
];

export enum BankPurchaseOrdersTabLabel {
  DraftedPOs = "Draft POs",
  IncompletePOs = "Incomplete POs",
  NotConfirmedPOs = "Not Confirmed POs",
  ConfirmedPOs = "Confirmed POs",
  AllPOs = "All POs",
}

export const BankPurchaseOrdersTabLabels = [
  BankPurchaseOrdersTabLabel.DraftedPOs,
  BankPurchaseOrdersTabLabel.IncompletePOs,
  BankPurchaseOrdersTabLabel.NotConfirmedPOs,
  BankPurchaseOrdersTabLabel.ConfirmedPOs,
  BankPurchaseOrdersTabLabel.AllPOs,
];

export enum BankEbbaTabLabel {
  SurveillanceCurrent = "Surveillance - Current",
  FinancialReports = "Financial Certifications",
  BorrowingBase = "Borrowing Base",
  SurveillanceHistorical = "Surveillance - Historical",
  AllCertifications = "All Certifications",
}

export const BankEbbaTabLabels = [
  BankEbbaTabLabel.SurveillanceCurrent,
  BankEbbaTabLabel.FinancialReports,
  BankEbbaTabLabel.BorrowingBase,
  BankEbbaTabLabel.SurveillanceHistorical,
  BankEbbaTabLabel.AllCertifications,
];

export enum SurveillanceStatusEnum {
  GoodStanding = "good_standing",
  OnProbation = "on_probation",
  OnPause = "on_pause",
  Defaulted = "defaulted",
  Onboarding = "onboarding",
  Inactive = "inactive",
  InReview = "in_review",
}

export const SurveillanceStatusToLabel = {
  [SurveillanceStatusEnum.GoodStanding]: "Good Standing",
  [SurveillanceStatusEnum.OnProbation]: "On Probation",
  [SurveillanceStatusEnum.OnPause]: "On Pause",
  [SurveillanceStatusEnum.Defaulted]: "Defaulted",
  [SurveillanceStatusEnum.Onboarding]: "Onboarding",
  [SurveillanceStatusEnum.Inactive]: "Inactive",
  [SurveillanceStatusEnum.InReview]: "In Review",
};

export enum SurveillanceOnPauseReasonEnum {
  OverThirtyDaysPastDue = "over_thirty_days_past_due",
  FinancialReportExpired = "financial_report_expired",
  BorrowingBaseExpired = "borrowing_base_expired",
  Underwriting = "underwriting",
  ClientSuccess = "client_success",
}

export const SurveillanceOnPauseReasonToLabel = {
  [SurveillanceOnPauseReasonEnum.OverThirtyDaysPastDue]:
    "Over 30 Days Past Due",
  [SurveillanceOnPauseReasonEnum.FinancialReportExpired]:
    "Financial Report Expired",
  [SurveillanceOnPauseReasonEnum.BorrowingBaseExpired]:
    "Borrowing Base Expired",
  [SurveillanceOnPauseReasonEnum.Underwriting]: "Underwriting",
  [SurveillanceOnPauseReasonEnum.ClientSuccess]: "Client Success",
};

export enum SurveillanceOnPauseReasonNotesEnum {
  Underwriting = "underwriting_notes",
  ClientSuccess = "client_success_notes",
}

export enum QualifyForEnum {
  LineOfCredit = "line_of_credit",
  InventoryFinancing = "inventory_financing",
  PurchaseMoneyFinancing = "purchase_money_financing",
  InvoiceFinancing = "invoice_financing",
  Failing = "failing",
  DisepnsaryFinancing = "dispensary_financing",
  None = "",
}

export const QualifyForToLabel = {
  [QualifyForEnum.LineOfCredit]: "Line of Credit",
  [QualifyForEnum.InventoryFinancing]: "Inventory Financing",
  [QualifyForEnum.PurchaseMoneyFinancing]: "Purchase Money Financing",
  [QualifyForEnum.InvoiceFinancing]: "Invoice Financing",
  [QualifyForEnum.Failing]: "Failing",
  [QualifyForEnum.DisepnsaryFinancing]: "Dispensary Financing",
  [QualifyForEnum.None]: "None",
};

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
export enum RepaymentMethodEnum {
  ACH = "ach",
  ReverseDraftACH = "reverse_draft_ach",
  Wire = "wire",
  Check = "check",
  Unknown = "unknown",
}

// Splitting the labels was necessary as we use RepaymentMethodToLabel
// in several places that are not a dropdown and the annotations
// do not make sense in that context
export const RepaymentMethodToDropdownLabel = {
  [RepaymentMethodEnum.ACH]:
    "Customer ACH (you send repayment from your banking software)",
  [RepaymentMethodEnum.ReverseDraftACH]:
    "Reverse Draft (we pull repayment from your account)",
  [RepaymentMethodEnum.Wire]:
    "Wire (you send repayment from your banking software)",
  [RepaymentMethodEnum.Check]: "Check",
  [RepaymentMethodEnum.Unknown]: "Unknown",
};

export const RepaymentMethodToLabel = {
  [RepaymentMethodEnum.ACH]: "ACH",
  [RepaymentMethodEnum.ReverseDraftACH]: "Reverse Draft",
  [RepaymentMethodEnum.Wire]: "Wire",
  [RepaymentMethodEnum.Check]: "Check",
  [RepaymentMethodEnum.Unknown]: "Unknown",
};

export const AllRepaymentMethods = [
  RepaymentMethodEnum.ReverseDraftACH,
  RepaymentMethodEnum.ACH,
  RepaymentMethodEnum.Wire,
  RepaymentMethodEnum.Check,
];

// Advance Method enum related
export enum AdvanceMethodEnum {
  ACH = "ach",
  Wire = "wire",
}

export const AdvanceMethodToLabel = {
  [AdvanceMethodEnum.ACH]: "ACH",
  [AdvanceMethodEnum.Wire]: "Wire",
};

export const AllAdvanceMethods = [
  AdvanceMethodEnum.ACH,
  AdvanceMethodEnum.Wire,
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
  RepaymentMethodEnum.ACH,
  RepaymentMethodEnum.Wire,
];

// Payment methods that a Payor may pay with.
export const PayorPaymentMethods = [
  RepaymentMethodEnum.ACH,
  RepaymentMethodEnum.Wire,
  RepaymentMethodEnum.Check,
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
  [RepaymentMethodEnum.Unknown]: "Unknown",
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
  [ProductTypeEnum.PurchaseMoneyFinancing]:
    JSON.stringify(PMFContractTermsJson),
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

export const LabelToProductType: { [key: string]: ProductTypeEnum } = {
  "Dispensary Financing": ProductTypeEnum.DispensaryFinancing,
  "Inventory Financing": ProductTypeEnum.InventoryFinancing,
  "Invoice Financing": ProductTypeEnum.InvoiceFinancing,
  "Line of Credit": ProductTypeEnum.LineOfCredit,
  "Purchase Money Financing": ProductTypeEnum.PurchaseMoneyFinancing,
  None: ProductTypeEnum.None,
};

// List of all supported product types, note that we do NOT include "None".
export const AllProductTypes = [
  ProductTypeEnum.DispensaryFinancing,
  ProductTypeEnum.InventoryFinancing,
  ProductTypeEnum.InvoiceFinancing,
  ProductTypeEnum.LineOfCredit,
  ProductTypeEnum.PurchaseMoneyFinancing,
];

export const RequestStatuses = [
  RequestStatusEnum.ApprovalRequested,
  RequestStatusEnum.Approved,
  RequestStatusEnum.Drafted,
  RequestStatusEnum.Incomplete,
  RequestStatusEnum.Rejected,
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
  [UserRolesEnum.Anonymous]: "Anonymous",
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
  CreatePurchaseOrderFromMetrcTransfers = "create_purchase_order_from_metrc_transfers",
  ReportingRequirementsCategory = "reporting_requirements_category",
}

export const AllFeatureFlags = [
  FeatureFlagEnum.CreatePurchaseOrderFromMetrcTransfers,
  FeatureFlagEnum.ReportingRequirementsCategory,
];

export enum ReportingRequirementsCategoryEnum {
  None = "none",
  One = "reporting_requirement_category_one",
  Two = "reporting_requirement_category_two",
  Three = "reporting_requirement_category_three",
  Four = "reporting_requirement_category_four",
}

export const ReportingRequirementsCategories = [
  ReportingRequirementsCategoryEnum.None,
  ReportingRequirementsCategoryEnum.One,
  ReportingRequirementsCategoryEnum.Two,
  ReportingRequirementsCategoryEnum.Three,
  ReportingRequirementsCategoryEnum.Four,
];

export const ReportingRequirementsCategoryToLabel = {
  [ReportingRequirementsCategoryEnum.None]: "None",
  [ReportingRequirementsCategoryEnum.One]: "Category One",
  [ReportingRequirementsCategoryEnum.Two]: "Category Two",
  [ReportingRequirementsCategoryEnum.Three]: "Category Three",
  [ReportingRequirementsCategoryEnum.Four]: "Category Four",
};

export const ReportingRequirementsCategoryToDescription = {
  [ReportingRequirementsCategoryEnum.None]: "",
  [ReportingRequirementsCategoryEnum.One]: (
    <ul>
      <li>Financial Report</li>
      <ul>
        <li>Balance Sheet</li>
        <li>Monthly Income Statement</li>
        <li>A/R Aging Summary Report</li>
        <li>A/P Aging Summary Report</li>
      </ul>
      <li>Borrowing Base: Based on Contract</li>
    </ul>
  ),
  [ReportingRequirementsCategoryEnum.Two]: (
    <ul>
      <li>Financial Report</li>
      <ul>
        <li>Balance Sheet</li>
        <li>Monthly Income Statement</li>
        <li>A/R Aging Summary Report</li>
        <li>A/P Aging Summary Report</li>
      </ul>
    </ul>
  ),
  [ReportingRequirementsCategoryEnum.Three]: (
    <ul>
      <li>POS Data</li>
      <ul>
        <li>Sales transactions data</li>
        <li>Inventory data</li>
      </ul>
    </ul>
  ),
  [ReportingRequirementsCategoryEnum.Four]: (
    <ul>
      <li>No reports required, CS is Metrc based</li>
    </ul>
  ),
};

export enum CustomMessageEnum {
  OVERVIEW_PAGE = "overview_page",
}

export const AllCustomMessages = [CustomMessageEnum.OVERVIEW_PAGE];

export enum CustomerSurveillanceCategoryEnum {
  BorrowingBase = "borrowing_base",
  FinancialReport = "financial_report",
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
  SoldIntoDebtFacility = "sold_into_debt_facility",
  BespokeBalanceSheet = "bespoke_balance_sheet",
  Repurchased = "repurchased",
  UpdateRequired = "update_required",
  Waiver = "waiver_loan",
}

export const DebtFacilityStatusToLabel = {
  [DebtFacilityStatusEnum.SoldIntoDebtFacility]: "Debt Facility",
  [DebtFacilityStatusEnum.BespokeBalanceSheet]: "Bespoke",
  [DebtFacilityStatusEnum.Repurchased]: "Repurchased",
  [DebtFacilityStatusEnum.UpdateRequired]: "Update Required",
  [DebtFacilityStatusEnum.Waiver]: "Waiver",
};

/*
  Company Debt Facility status supercedes loan debt facility status
  i.e. If a company is ineligible, then that supercedes whether or not
  a specific loan can be sold into the debt facility
  Caveat: If there is a waiver, it is eligible regardless
*/
export const DebtFacilityStatusToEligibility = {
  [DebtFacilityStatusEnum.SoldIntoDebtFacility]: "Eligible",
  [DebtFacilityStatusEnum.BespokeBalanceSheet]: "Eligible",
  // Repurchased is for when  company goes from good standing to bad standing
  // If/when a company reverses and is in good standing again, remaining open loans should
  // be automatically changed to the bespoke balance sheet status
  [DebtFacilityStatusEnum.Repurchased]: "Ineligible",
  [DebtFacilityStatusEnum.UpdateRequired]: "Ineligible",
  [DebtFacilityStatusEnum.Waiver]: "Waiver",
};

// Debt Facility Company Status

export enum DebtFacilityCompanyStatusEnum {
  GoodStanding = "good_standing",
  OnProbation = "on_probation",
  OutOfCompliance = "out_of_compliance",
  Defaulting = "defaulting",
  // must be default state for dispensary financing clients
  IneligibleForFacility = "ineligible_for_facility",
  Waiver = "waiver_company",
}

export const DebtFacilityCompanyStatusToLabel = {
  [DebtFacilityCompanyStatusEnum.GoodStanding]: "Good Standing",
  [DebtFacilityCompanyStatusEnum.OnProbation]: "Probation",
  [DebtFacilityCompanyStatusEnum.OutOfCompliance]: "Paused",
  [DebtFacilityCompanyStatusEnum.Defaulting]: "Defaulted",
  [DebtFacilityCompanyStatusEnum.IneligibleForFacility]:
    "Ineligible for Facility",
  [DebtFacilityCompanyStatusEnum.Waiver]: "Waiver",
};

/* 
Splitting this out because while we have multiple "bad" states, that summarizes
to less buckets for the report we send to the debt facility. However, the mutliple
bad states is still useful for internal purposes
*/
export const DebtFacilityCompanyStatusToEligibility = {
  [DebtFacilityCompanyStatusEnum.GoodStanding]: "Eligible",
  [DebtFacilityCompanyStatusEnum.OnProbation]: "Eligible",
  [DebtFacilityCompanyStatusEnum.OutOfCompliance]: "Ineligible",
  [DebtFacilityCompanyStatusEnum.Defaulting]: "Ineligible",
  [DebtFacilityCompanyStatusEnum.IneligibleForFacility]: "Ineligible",
  [DebtFacilityCompanyStatusEnum.Waiver]: "Waiver",
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

export enum DebtFacilityEventCategoryEnum {
  Waiver = "waiver",
  Repurchase = "repurchase",
  MoveToDebtFacility = "move_to_debt_facility",
  CompanyStatusChange = "company_status_change",
}

export const DebtFacilityEventCategoryToLabel = {
  [DebtFacilityEventCategoryEnum.Waiver]: "Waiver",
  [DebtFacilityEventCategoryEnum.Repurchase]: "Repurchase",
  [DebtFacilityEventCategoryEnum.MoveToDebtFacility]: "Move to Debt Facility",
  [DebtFacilityEventCategoryEnum.CompanyStatusChange]: "Company Status Change",
};

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

export enum BankAccountType {
  Checking = "Checking",
  Savings = "Savings",
}
