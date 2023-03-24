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

export const FinancialReportsMaxMonthsAmount = 12;

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

export enum BespokeCompanyRole {
  ClientSuccess = "client_success",
  BusinessDevelopment = "business_development",
  Underwriter = "underwriter",
}

export const BespokeCompanyRoles = [
  BespokeCompanyRole.ClientSuccess,
  BespokeCompanyRole.BusinessDevelopment,
  BespokeCompanyRole.Underwriter,
];

export const BespokeCompanyRoleToLabel = {
  [BespokeCompanyRole.ClientSuccess]: "Client Success",
  [BespokeCompanyRole.BusinessDevelopment]: "Business Development",
  [BespokeCompanyRole.Underwriter]: "Underwriter",
};

export interface USStateEnumInstance {
  abbreviation: string;
  full: string;
}

export interface USStateEnum {
  [key: string]: USStateEnumInstance;
}

export const USStates: USStateEnum = {
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

export enum RepaymentTypeEnum {
  Closed = "closed",
  RequestedReverseDraftACH = "requested-reverse-draft-ach",
  ReverseDraftACH = "reverse-draft-ach",
  Other = "other",
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

export enum BankFinancingRequestsTabLabel {
  ActionRequired = "Action Required",
  Archived = "Archived",
}

export const BankFinancingRequestsTabLabels = [
  BankFinancingRequestsTabLabel.ActionRequired,
  BankFinancingRequestsTabLabel.Archived,
];

export enum BankLoansTabLabelNew {
  Active = "Active",
  Closed = "Closed",
  All = "All",
}

export const BankLoansTabLabelsNew = [
  BankLoansTabLabelNew.Active,
  BankLoansTabLabelNew.Closed,
  BankLoansTabLabelNew.All,
];

export enum BankLoansMaturingInTimeWindow {
  All = "All",
  SevenDays = "Maturing in 7 days",
  FourteenDays = "Maturing in 14 days",
  ThirtyDays = "Maturing in 30 days",
  PastDue = "Past Due",
}

export const BankLoansMaturingInTimeWindowList = [
  BankLoansMaturingInTimeWindow.All,
  BankLoansMaturingInTimeWindow.SevenDays,
  BankLoansMaturingInTimeWindow.FourteenDays,
  BankLoansMaturingInTimeWindow.ThirtyDays,
  BankLoansMaturingInTimeWindow.PastDue,
];

export enum VendorPurchaseOrdersTabLabel {
  Active = "Active",
  Archived = "Archived",
}

export const VendorPurchaseOrdersTabLabels = [
  VendorPurchaseOrdersTabLabel.Active,
  VendorPurchaseOrdersTabLabel.Archived,
];

export enum BankPurchaseOrdersTabLabel {
  DraftedPOs = "Draft POs",
  IncompletePOs = "Incomplete POs",
  NotConfirmedPOs = "Not Confirmed POs",
  ConfirmedPOs = "Confirmed POs",
  AllPOs = "All POs",
}

export const BankPurchaseOrdersTabLabels = [
  BankPurchaseOrdersTabLabel.NotConfirmedPOs,
  BankPurchaseOrdersTabLabel.DraftedPOs,
  BankPurchaseOrdersTabLabel.IncompletePOs,
  BankPurchaseOrdersTabLabel.ConfirmedPOs,
  BankPurchaseOrdersTabLabel.AllPOs,
];

export enum BankPurchaseOrdersTabLabelNew {
  ReadyForFinancing = "Ready for Financing",
  NotReadyForFinancing = "Not Ready for Financing",
  Archived = "Archived",
  All = "All",
}

export const BankPurchaseOrdersTabLabelsNew = [
  BankPurchaseOrdersTabLabelNew.ReadyForFinancing,
  BankPurchaseOrdersTabLabelNew.NotReadyForFinancing,
  BankPurchaseOrdersTabLabelNew.Archived,
  BankPurchaseOrdersTabLabelNew.All,
];

export enum BankPurchaseOrdersDrawerTabLabelNew {
  GeneralInformation = "General information",
  History = "History",
  Financing = "Financing",
  OnlyForBank = "Only for bank",
}

export const BankPurchaseOrdersDrawerTabLabelsNew = [
  BankPurchaseOrdersDrawerTabLabelNew.GeneralInformation,
  BankPurchaseOrdersDrawerTabLabelNew.History,
  BankPurchaseOrdersDrawerTabLabelNew.Financing,
  BankPurchaseOrdersDrawerTabLabelNew.OnlyForBank,
];

export enum BankLoansDrawerTabLabelNew {
  GeneralInformation = "General information",
  PurchaseOrderInformation = "PO Information",
  RecipientBankInformation = "Recipient bank information",
  OnlyForBank = "Only for bank",
}

export const BankLoansDrawerTabLabelsNew = [
  BankLoansDrawerTabLabelNew.GeneralInformation,
  BankLoansDrawerTabLabelNew.PurchaseOrderInformation,
  BankLoansDrawerTabLabelNew.RecipientBankInformation,
  BankLoansDrawerTabLabelNew.OnlyForBank,
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

export enum BankCompaniesTabLabel {
  Customers = "Customers",
  Vendors = "Vendors",
  Payors = "Payors",
  Companies = "Companies",
  ParentCompanies = "Parent Companies",
}

export const BankCompaniesTabLabels = [
  BankCompaniesTabLabel.Customers,
  BankCompaniesTabLabel.Vendors,
  BankCompaniesTabLabel.Payors,
  BankCompaniesTabLabel.Companies,
  BankCompaniesTabLabel.ParentCompanies,
];

export enum BankVendorsTabLabel {
  NotApproved = "Not Approved Vendors",
  Approved = "Approved Vendors",
  All = "All Vendors",
}

export const BankVendorsTabLabels = [
  BankVendorsTabLabel.All,
  BankVendorsTabLabel.NotApproved,
  BankVendorsTabLabel.Approved,
];

export enum BankCompanyLabel {
  ParentCompany = "Parent Company",
  Company = "Company",
}

export const BankCompanyLabels = [
  BankCompanyLabel.ParentCompany,
  BankCompanyLabel.Company,
];

export enum BespokeCatalogTabLabel {
  SalesTransactions = "Sales Transactions",
  IncomingTransferPackages = "Incoming Transfer Packages",
  InventoryPackages = "Inventory Packages",
  RecentlyAdded = "Recently Added",
  BespokeCatalog = "Bespoke Catalog",
}

export const BespokeCatalogTabLabels = [
  BespokeCatalogTabLabel.SalesTransactions,
  BespokeCatalogTabLabel.IncomingTransferPackages,
  BespokeCatalogTabLabel.InventoryPackages,
  BespokeCatalogTabLabel.RecentlyAdded,
  BespokeCatalogTabLabel.BespokeCatalog,
];

export enum SkuGroupUnitOfMeasure {
  Each = "each",
  Grams = "gram",
  Milligram = "milligram",
  Kilogram = "kilogram",
  Liter = "liter",
  Milliliter = "milliliter",
  Ounce = "ounce",
  Pound = "pound",
  FluidOunce = "fluid_ounce",
  Gallon = "gallon",
}

export const SkuGroupUnitOfMeasureToLabel = {
  [SkuGroupUnitOfMeasure.Each]: "Each",
  [SkuGroupUnitOfMeasure.Grams]: "Grams (g)",
  [SkuGroupUnitOfMeasure.Milligram]: "Milligram (mg)",
  [SkuGroupUnitOfMeasure.Kilogram]: "Kilogram (kg)",
  [SkuGroupUnitOfMeasure.Liter]: "Liter (L)",
  [SkuGroupUnitOfMeasure.Milliliter]: "Milliliter (mL)",
  [SkuGroupUnitOfMeasure.Ounce]: "Ounce (oz)",
  [SkuGroupUnitOfMeasure.Pound]: "Pound (lb)",
  [SkuGroupUnitOfMeasure.FluidOunce]: "Fluid Ounce (fl oz)",
  [SkuGroupUnitOfMeasure.Gallon]: "Gallon (gal)",
};

export const SkuGroupUnitOfMeasureLabels = [
  SkuGroupUnitOfMeasure.Each,
  SkuGroupUnitOfMeasure.Grams,
  SkuGroupUnitOfMeasure.Milligram,
  SkuGroupUnitOfMeasure.Kilogram,
  SkuGroupUnitOfMeasure.Liter,
  SkuGroupUnitOfMeasure.Milliliter,
  SkuGroupUnitOfMeasure.Ounce,
  SkuGroupUnitOfMeasure.Pound,
  SkuGroupUnitOfMeasure.FluidOunce,
  SkuGroupUnitOfMeasure.Gallon,
];

export enum MetrcToBespokeCatalogSkuConfidenceLabel {
  High = "High",
  Medium = "Medium",
  Low = "Low",
  Invalid = "Invalid",
}

export const MetrcToBespokeCatalogSkuConfidenceLabels = [
  MetrcToBespokeCatalogSkuConfidenceLabel.High,
  MetrcToBespokeCatalogSkuConfidenceLabel.Medium,
  MetrcToBespokeCatalogSkuConfidenceLabel.Low,
  MetrcToBespokeCatalogSkuConfidenceLabel.Invalid,
];

export enum NewPurchaseOrderStatus {
  // Not Ready
  Draft = "draft",
  PendingApprovalByVendor = "pending_approval_by_vendor",
  ChangesRequestedByVendor = "changes_requested_by_vendor",
  ChangesRequestedByBespoke = "changes_requested_by_bespoke",
  // Ready
  ReadyToRequestFinancing = "ready_to_request_financing",
  FinancingPendingApproval = "financing_pending_approval",
  FinancingRequestApproved = "financing_request_approved",
  // Closed
  Archived = "archived",
  RejectedByVendor = "rejected_by_vendor",
  RejectedByBespoke = "rejected_by_bespoke",
}

export const NotReadyNewPurchaseOrderStatuses = [
  NewPurchaseOrderStatus.Draft,
  NewPurchaseOrderStatus.PendingApprovalByVendor,
  NewPurchaseOrderStatus.ChangesRequestedByVendor,
  NewPurchaseOrderStatus.ChangesRequestedByBespoke,
];

export const ReadyNewPurchaseOrderStatuses = [
  NewPurchaseOrderStatus.ReadyToRequestFinancing,
  NewPurchaseOrderStatus.FinancingPendingApproval,
  NewPurchaseOrderStatus.FinancingRequestApproved,
];

export const ClosedNewPurchaseOrderStatuses = [
  NewPurchaseOrderStatus.Archived,
  NewPurchaseOrderStatus.RejectedByVendor,
  NewPurchaseOrderStatus.RejectedByBespoke,
];

export const VendorActivePurchaseOrderStatuses = [
  NewPurchaseOrderStatus.PendingApprovalByVendor,
  NewPurchaseOrderStatus.ChangesRequestedByVendor,
  NewPurchaseOrderStatus.ChangesRequestedByBespoke,
  NewPurchaseOrderStatus.ReadyToRequestFinancing,
  NewPurchaseOrderStatus.FinancingPendingApproval,
  NewPurchaseOrderStatus.FinancingRequestApproved,
];

export const VendorArchivedPurchaseOrderStatuses = [
  NewPurchaseOrderStatus.Archived,
  NewPurchaseOrderStatus.RejectedByVendor,
  NewPurchaseOrderStatus.RejectedByBespoke,
];

export const NewPurchaseOrderStatusToLabel = {
  // Not Ready
  [NewPurchaseOrderStatus.Draft]: "Draft",
  [NewPurchaseOrderStatus.PendingApprovalByVendor]:
    "Pending approval by vendor",
  [NewPurchaseOrderStatus.ChangesRequestedByVendor]:
    "Changes required for approval",
  [NewPurchaseOrderStatus.ChangesRequestedByBespoke]: "Changes requested",
  // Ready
  [NewPurchaseOrderStatus.ReadyToRequestFinancing]:
    "Ready to request financing",
  [NewPurchaseOrderStatus.FinancingPendingApproval]:
    "Financing pending approval",
  [NewPurchaseOrderStatus.FinancingRequestApproved]:
    "Financing request approved",
  [NewPurchaseOrderStatus.Archived]: "Archived",
  [NewPurchaseOrderStatus.RejectedByVendor]: "Rejected by vendor",
  [NewPurchaseOrderStatus.RejectedByBespoke]: "Rejected by BF",
};

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

export const SurveillanceStatusToDropdownLabel = {
  [SurveillanceStatusEnum.GoodStanding]: "Good Standing (Allows Advances)",
  [SurveillanceStatusEnum.OnProbation]: "On Probation (Allows Advances)",
  [SurveillanceStatusEnum.OnPause]: "On Pause",
  [SurveillanceStatusEnum.Defaulted]: "Defaulted",
  [SurveillanceStatusEnum.Onboarding]: "Onboarding",
  [SurveillanceStatusEnum.Inactive]: "Inactive",
  [SurveillanceStatusEnum.InReview]: "In Review",
};

export enum SurveillanceOnPauseReasonEnum {
  OverThirtyDaysPastDue = "over_thirty_days_past_due",
  OverAcceptablePercentPastDue = "over_acceptable_percent_past_due",
  FinancialReportExpired = "financial_report_expired",
  BorrowingBaseExpired = "borrowing_base_expired",
  Underwriting = "underwriting",
  ClientSuccess = "client_success",
}

export const SurveillanceOnPauseReasonToLabel = {
  [SurveillanceOnPauseReasonEnum.OverThirtyDaysPastDue]:
    "Over 30 Days Past Due",
  [SurveillanceOnPauseReasonEnum.OverAcceptablePercentPastDue]:
    "Over 25% of Loans Past Due",
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
  DisepnsaryFinancing = "dispensary_financing",
  Failing = "failing",
  None = "",
}

export const QualifyForToLabel = {
  [QualifyForEnum.LineOfCredit]: "Line of Credit",
  [QualifyForEnum.InventoryFinancing]: "Inventory Financing",
  [QualifyForEnum.PurchaseMoneyFinancing]: "Purchase Money Financing",
  [QualifyForEnum.InvoiceFinancing]: "Invoice Financing",
  [QualifyForEnum.DisepnsaryFinancing]: "Dispensary Financing",
  [QualifyForEnum.Failing]: "Failing",
  [QualifyForEnum.None]: "None",
};

export const QualifyForToDropdownLabel = {
  [QualifyForEnum.LineOfCredit]: "Line of Credit",
  [QualifyForEnum.InventoryFinancing]: "Inventory Financing",
  [QualifyForEnum.PurchaseMoneyFinancing]: "Purchase Money Financing",
  [QualifyForEnum.InvoiceFinancing]: "Invoice Financing",
  [QualifyForEnum.DisepnsaryFinancing]: "Dispensary Financing",
  [QualifyForEnum.Failing]: "Failing (No Advances Allowed)",
  [QualifyForEnum.None]: "None (Surveillance Not Yet Complete)",
};

export enum CustomerPurchaseOrdersTabLabel {
  ActivePOs = "Active POs",
  ClosedPOs = "Closed POs",
}

export enum CustomerPurchaseOrdersTabLabelNew {
  Active = "Active",
  Archived = "Archived",
}

export const CustomerPurchaseOrdersTabLabels = [
  CustomerPurchaseOrdersTabLabel.ActivePOs,
  CustomerPurchaseOrdersTabLabel.ClosedPOs,
];

export const CustomerPurchaseOrdersTabLabelsNew = [
  CustomerPurchaseOrdersTabLabelNew.Active,
  CustomerPurchaseOrdersTabLabelNew.Archived,
];

export const PaymentTypeToLabel = {
  [PaymentTypeEnum.Adjustment]: "Adjustment",
  [PaymentTypeEnum.Advance]: "Advance",
  [PaymentTypeEnum.CreditToUser]: "Credit To Borrower",
  [PaymentTypeEnum.Fee]: "Account Fee",
  [PaymentTypeEnum.FeeWaiver]: "Account Fee Waiver",
  [PaymentTypeEnum.PayoutUserCreditToCustomer]: "Payout To Borrower",
  [PaymentTypeEnum.Repayment]: "Repayment",
  [PaymentTypeEnum.RepaymentOfAccountFee]: "Account Fee Repayment",
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
  NoPayment = "no_payment",
  PartiallyPaid = "partially_paid",
  Pending = "pending",
  Scheduled = "scheduled",
  Closing = "closing",
  Closed = "closed",
}

// PaymentStatus internal name to label
export const LoanPaymentStatusToLabel = {
  [LoanPaymentStatusEnum.NoPayment]: "No Payment",
  [LoanPaymentStatusEnum.PartiallyPaid]: "Partially Paid",
  [LoanPaymentStatusEnum.Pending]: "Payment Pending",
  [LoanPaymentStatusEnum.Scheduled]: "Payment Scheduled",
  [LoanPaymentStatusEnum.Closing]: "Closing",
  [LoanPaymentStatusEnum.Closed]: "Closed",
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
  Archived = "archived",
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
  [LoanStatusEnum.Archived]: "Archived",
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

export const NonLOCCustomerPaymentOptions = [
  PaymentOptionEnum.InFull,
  PaymentOptionEnum.CustomAmount,
];

export const PaymentOptionToLabel = {
  [PaymentOptionEnum.InFull]: "Pay in full",
  [PaymentOptionEnum.MinimumDue]: "Pay minimum due",
  [PaymentOptionEnum.CustomAmount]: "Pay custom amount",
  [RepaymentMethodEnum.Unknown]: "Unknown",
};

export enum CustomerRoleEnum {
  Financials = "financials",
  PurchaseOrderEdits = "purchase_order_edits",
  Repayments = "repayments",
  Executive = "executive",
  SalesRep = "sales_rep",
  None = "none",
  Other = "other",
}

export const CustomerRoleToLabel = {
  [CustomerRoleEnum.Financials]: "Financials",
  [CustomerRoleEnum.PurchaseOrderEdits]: "PO Edits",
  [CustomerRoleEnum.Repayments]: "Repayments",
  [CustomerRoleEnum.Executive]: "Executive",
  [CustomerRoleEnum.SalesRep]: "Sales Rep",
  [CustomerRoleEnum.None]: "None",
  [CustomerRoleEnum.Other]: "Other",
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

export enum ArtifactType {
  None = "",
  Invoice = "Invoice",
  PurchaseOrder = "Purchase Order",
}

export const ProductTypeToArtifactType = {
  [ProductTypeEnum.DispensaryFinancing]: ArtifactType.PurchaseOrder,
  [ProductTypeEnum.InventoryFinancing]: ArtifactType.PurchaseOrder,
  [ProductTypeEnum.InvoiceFinancing]: ArtifactType.Invoice,
  [ProductTypeEnum.LineOfCredit]: "", // should never be used, only included for type checking
  [ProductTypeEnum.PurchaseMoneyFinancing]: ArtifactType.PurchaseOrder,
  [ProductTypeEnum.None]: ArtifactType.None,
};

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
  [UserRolesEnum.BespokeCatalogDataEntry]: "Bespoke Catalog Data Entry",
  [UserRolesEnum.BespokeCatalogDataEntryInherited]:
    "Bespoke Catalog Data Entry",
  [UserRolesEnum.CompanyAdmin]: "Company Admin",
  [UserRolesEnum.CompanyReadOnly]: "Company User (View Only)",
  [UserRolesEnum.CompanyContactOnly]: "Company Contact (No Account)",
  [UserRolesEnum.Anonymous]: "Anonymous",
  [UserRolesEnum.VendorAdmin]: "Vendor Admin",
  [UserRolesEnum.CompanyAdminVendorAdminInherited]: "Company and Vendor Admin",
};

export const InheritedRolesToBaseRoles = {
  [UserRolesEnum.BespokeCatalogDataEntryInherited]: [
    UserRolesEnum.BespokeCatalogDataEntry,
  ],
  [UserRolesEnum.CompanyAdminVendorAdminInherited]: [
    UserRolesEnum.CompanyAdmin,
    UserRolesEnum.VendorAdmin,
  ],
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
export const VendorCompanyUserRoles = [UserRolesEnum.VendorAdmin];
export const CustomerAndVendorCompanyUserRoles = [
  UserRolesEnum.CompanyAdminVendorAdminInherited,
];

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
  OverrideRepaymentAutogeneration = "override_repayment_autogeneration",
}

export const AllFeatureFlags = [
  FeatureFlagEnum.CreatePurchaseOrderFromMetrcTransfers,
  FeatureFlagEnum.ReportingRequirementsCategory,
  FeatureFlagEnum.OverrideRepaymentAutogeneration,
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
  Eligible = "eligible",
  Ineligible = "ineligible",
  Waiver = "waiver_company",
  PendingWaiver = "pending_waiver",
}

export const DebtFacilityCompanyStatusToLabel = {
  [DebtFacilityCompanyStatusEnum.Eligible]: "Eligible",
  [DebtFacilityCompanyStatusEnum.Ineligible]: "Ineligible",
  [DebtFacilityCompanyStatusEnum.Waiver]: "Waiver",
  [DebtFacilityCompanyStatusEnum.PendingWaiver]: "Pending Waiver",
};

/* 
Splitting this out because while we have multiple "bad" states, that summarizes
to less buckets for the report we send to the debt facility. However, the mutliple
bad states is still useful for internal purposes
*/
export const DebtFacilityCompanyStatusToEligibility = {
  [DebtFacilityCompanyStatusEnum.Eligible]: "Eligible",
  [DebtFacilityCompanyStatusEnum.Ineligible]: "Ineligible",
  [DebtFacilityCompanyStatusEnum.Waiver]: "Eligible",
  [DebtFacilityCompanyStatusEnum.PendingWaiver]: "Eligible",
};

export enum DebtFacilityTabLabel {
  Open = "Loans - Open",
  ActionRequired = "Loans - Action Required",
  All = "Loans - All",
  Customers = "Customers",
  Report = "Loans - Report",
  Admin = "Admin",
}

export type DebtFacilityTabLabelType =
  | typeof DebtFacilityTabLabel.Open
  | typeof DebtFacilityTabLabel.ActionRequired
  | typeof DebtFacilityTabLabel.All
  | typeof DebtFacilityTabLabel.Customers
  | typeof DebtFacilityTabLabel.Report
  | typeof DebtFacilityTabLabel.Admin;

export const DebtFacilityTabLabels: DebtFacilityTabLabelType[] = [
  DebtFacilityTabLabel.Open,
  DebtFacilityTabLabel.ActionRequired,
  DebtFacilityTabLabel.All,
  DebtFacilityTabLabel.Customers,
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

export enum MetrcTransferDrawerTabLabel {
  GeneralInformation = "General information",
  OnlyForBank = "Only for bank",
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

export enum PartnershipRequestType {
  VendorSubmitted = "vendor_submitted",
  MoveToAction = "move_to_action",
}

export enum BankReportsTabLabel {
  FinancialsForCustomer = "Financials - For Customer",
  FinancialsForDate = "Financials - For Date",
  FinancialsForLoan = "Financials - For Loan",
  PredictedFinancialsForCustomer = "Predicted Financials - For Customer",
  Transactions = "Transactions",
  BorrowersEndDates = "Borrowers - End Dates",
}

export type BankReportsTabLabelType =
  | typeof BankReportsTabLabel.FinancialsForCustomer
  | typeof BankReportsTabLabel.FinancialsForDate
  | typeof BankReportsTabLabel.FinancialsForLoan
  | typeof BankReportsTabLabel.PredictedFinancialsForCustomer
  | typeof BankReportsTabLabel.Transactions
  | typeof BankReportsTabLabel.BorrowersEndDates;

export const BankReportTabLabels: BankReportsTabLabelType[] = [
  BankReportsTabLabel.FinancialsForCustomer,
  BankReportsTabLabel.FinancialsForDate,
  BankReportsTabLabel.FinancialsForLoan,
  BankReportsTabLabel.PredictedFinancialsForCustomer,
  BankReportsTabLabel.Transactions,
  BankReportsTabLabel.BorrowersEndDates,
];

export enum AsyncJobStatusEnum {
  Queued = "queued",
  Initialized = "initialized",
  InProgress = "in_progress",
  Failed = "failed",
  Completed = "completed",
}

export const AsyncJobStatusToLabel = {
  [AsyncJobStatusEnum.Queued]: "Queued",
  [AsyncJobStatusEnum.Initialized]: "Initialized",
  [AsyncJobStatusEnum.InProgress]: "In Progress",
  [AsyncJobStatusEnum.Failed]: "Failed",
  [AsyncJobStatusEnum.Completed]: "Completed",
};

export const AsyncJobStatuses = [
  AsyncJobStatusEnum.Queued,
  AsyncJobStatusEnum.Initialized,
  AsyncJobStatusEnum.InProgress,
  AsyncJobStatusEnum.Failed,
  AsyncJobStatusEnum.Completed,
];

export enum AsyncJobNameEnum {
  AutogenerateRepayments = "autogenerate_repayments",
  AutogenerateRepaymentAlerts = "autogenerate_repayment_alerts",
  AutomaticDebitCourtesyAlerts = "automatic_debit_courtesy_alerts",
  DownloadDataForMetrcApiKeyLicense = "download_data_for_metrc_api_key_license",
  FinancialReportsComingDueAlerts = "financial_reports_coming_due_alerts",
  LoansComingDue = "loans_coming_due",
  LoansPastDue = "loans_past_due",
  LOCMonthlyReportSummary = "loc_monthly_report_summary",
  NonLOCMonthlyReportSummary = "non_loc_monthly_report_summary",
  PurchaseOrdersPastDue = "purchase_orders_past_due",
  RefreshMetrcApiKeyPermissions = "refresh_metrc_api_key_permissions",
  DailyCompanyBalancesRun = "daily_company_balances_run",
  UpdateCompanyBalances = "update_company_balances",
  AsyncMonitoring = "async_monitoring",
}

export const AsyncJobNameEnumToLabel = {
  [AsyncJobNameEnum.AutogenerateRepayments]: "Autogenerate Repayments",
  [AsyncJobNameEnum.AutogenerateRepaymentAlerts]:
    "Autogenerate Repayment Alerts",
  [AsyncJobNameEnum.AutomaticDebitCourtesyAlerts]:
    "Automatic Debit Courtesy Alerts",
  [AsyncJobNameEnum.DownloadDataForMetrcApiKeyLicense]:
    "Download Data for Metrc API Key License",
  [AsyncJobNameEnum.FinancialReportsComingDueAlerts]:
    "Financial Reports Coming Due Alerts",
  [AsyncJobNameEnum.LoansComingDue]: "Loans Coming Due",
  [AsyncJobNameEnum.LoansPastDue]: "Loans Past Due",
  [AsyncJobNameEnum.LOCMonthlyReportSummary]: "LOC Monthly Report Summary",
  [AsyncJobNameEnum.NonLOCMonthlyReportSummary]:
    "Non LOC Monthly Report Summary",
  [AsyncJobNameEnum.PurchaseOrdersPastDue]: "Purchase Orders Past Due",
  [AsyncJobNameEnum.RefreshMetrcApiKeyPermissions]:
    "Refresh Metrc API Key Permissions",
  [AsyncJobNameEnum.DailyCompanyBalancesRun]: "Daily Company Balances Run",
  [AsyncJobNameEnum.UpdateCompanyBalances]: "Update Company Balances",
  [AsyncJobNameEnum.AsyncMonitoring]: "Async Monitoring",
};

export const AsyncJobNames = [
  AsyncJobNameEnum.AutogenerateRepayments,
  AsyncJobNameEnum.AutogenerateRepaymentAlerts,
  AsyncJobNameEnum.AutomaticDebitCourtesyAlerts,
  AsyncJobNameEnum.DownloadDataForMetrcApiKeyLicense,
  AsyncJobNameEnum.FinancialReportsComingDueAlerts,
  AsyncJobNameEnum.LoansComingDue,
  AsyncJobNameEnum.LoansPastDue,
  AsyncJobNameEnum.LOCMonthlyReportSummary,
  AsyncJobNameEnum.NonLOCMonthlyReportSummary,
  AsyncJobNameEnum.PurchaseOrdersPastDue,
  AsyncJobNameEnum.RefreshMetrcApiKeyPermissions,
  AsyncJobNameEnum.DailyCompanyBalancesRun,
  AsyncJobNameEnum.UpdateCompanyBalances,
  AsyncJobNameEnum.AsyncMonitoring,
];

export enum VendorChangeRequestsStatusEnum {
  ApprovalRequested = "approval_requested",
  //InReview = "in_review",
  Approved = "approved",
  //Rejected = "rejected",
}

export const VendorChangeRequestsStatusToLabel = {
  [VendorChangeRequestsStatusEnum.ApprovalRequested]: "Approval Requested",
  //[VendorChangeRequestsStatusEnum.InReview]: "In Review",
  [VendorChangeRequestsStatusEnum.Approved]: "Approved",
  //[VendorChangeRequestsStatusEnum.Rejected]: "Rejected",
};

export enum VendorChangeRequestsCategoryEnum {
  PartnershipContactChange = "partnership_contact_change",
  ContactInfoChange = "contact_info_change",
}

export const VendorChangeRequestsCategoryToLabel = {
  [VendorChangeRequestsCategoryEnum.PartnershipContactChange]:
    "Partnership Contact Change",
  [VendorChangeRequestsCategoryEnum.ContactInfoChange]: "Contact Info Change",
};

export enum PlatformModeEnum {
  Bank = "bank",
  Customer = "customer",
  Vendor = "vendor",
  Anonymous = "anonymous",
}

export const BankUserBaseRoles = [
  UserRolesEnum.BankAdmin,
  UserRolesEnum.BankReadOnly,
];

export const CustomerUserBaseRoles = [
  UserRolesEnum.CompanyAdmin,
  UserRolesEnum.CompanyReadOnly,
];

export const VendorUserBaseRoles = [UserRolesEnum.VendorAdmin];

export enum CustomerEmailsEnum {
  FinancialStatementAlerts = "financial_statement_alerts",
}

export enum TPExportCategoryEnum {
  Ineligible = "ineligible",
  EligibleDispensary = "eligible_dispensary",
  EligibleCore = "eligible_core",
  All = "all",
}

export const TPExportCategoryEnums = [
  TPExportCategoryEnum.Ineligible,
  TPExportCategoryEnum.EligibleDispensary,
  TPExportCategoryEnum.EligibleCore,
  TPExportCategoryEnum.All,
];

export const TPExportCategoryEnumToLabel = {
  [TPExportCategoryEnum.Ineligible]: "Ineligible",
  [TPExportCategoryEnum.EligibleDispensary]: "Eligible Dispensary Financing",
  [TPExportCategoryEnum.EligibleCore]: "Eligible Core",
  [TPExportCategoryEnum.All]: "All",
};
