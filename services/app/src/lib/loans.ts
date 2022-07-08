import {
  Companies,
  CompanyVendorPartnerships,
  GetAdvancesBankAccountsForCustomerQuery,
  LoanArtifactLimitedFragment,
  LoanLimitedFragment,
  LoanTypeEnum,
  Maybe,
} from "generated/graphql";
import { getCompanyDisplayName } from "lib/companies";
import { UUIDEnum } from "lib/enum";
import { uniq } from "lodash";

export function createLoanCustomerIdentifier(
  loan: LoanLimitedFragment,
  anonymousName?: Maybe<string>
) {
  return !!anonymousName
    ? `${getAnonymizedShortName(anonymousName)}/${loan.identifier}`
    : `${loan.company.identifier}/${loan.identifier}`;
}

export function createLoanDisbursementIdentifier(
  loan: LoanLimitedFragment,
  anonymousName?: Maybe<string>
) {
  return !!anonymousName
    ? `${getAnonymizedShortName(anonymousName)}-${loan.disbursement_identifier}`
    : loan.disbursement_identifier
    ? `${loan.company.identifier}-${loan.disbursement_identifier}`
    : "-";
}

export function getAnonymizedShortName(anonymousName: Maybe<string>) {
  return !!anonymousName
    ? anonymousName.charAt(0) + anonymousName.charAt(anonymousName.length - 1)
    : "";
}

export function getLoanArtifactName(loan: LoanArtifactLimitedFragment) {
  return loan.purchase_order
    ? loan.purchase_order.order_number
    : loan.invoice
    ? loan.invoice.invoice_number
    : !!loan.line_of_credit?.is_credit_for_vendor
    ? getCompanyDisplayName(loan.line_of_credit.recipient_vendor)
    : "N/A";
}

export function getLoanVendorName(loan: LoanArtifactLimitedFragment) {
  return loan.purchase_order
    ? getCompanyDisplayName(loan.purchase_order.vendor)
    : loan.line_of_credit
    ? !!loan.line_of_credit.is_credit_for_vendor
      ? getCompanyDisplayName(loan.line_of_credit.recipient_vendor)
      : "N/A"
    : "N/A";
}

export const extractCustomerId = (loans: LoanLimitedFragment[]) => {
  const allCustomerIds = loans.map((loan) => loan.company_id);
  const uniqueCustomerIds = uniq(allCustomerIds);
  const isOnlyOneCustomer = uniqueCustomerIds.length <= 1;

  return isOnlyOneCustomer ? uniqueCustomerIds[0] : null;
};

export const extractRecipientCompanyId = (
  loans: Array<LoanArtifactLimitedFragment & LoanLimitedFragment>
) => {
  const allRecipientIds = loans.map((loan) => {
    if (loan.loan_type === LoanTypeEnum.PurchaseOrder) {
      return loan.purchase_order?.vendor_id;
    }
    if (loan.loan_type === LoanTypeEnum.LineOfCredit) {
      return loan.line_of_credit?.recipient_vendor_id || loan.company_id;
    }
    return loan.company_id;
  });
  const uniqueRecipientIds = uniq(allRecipientIds);
  const isOnlyOneRecipient = uniqueRecipientIds.length <= 1;

  return isOnlyOneRecipient ? uniqueRecipientIds[0] : null;
};

export const extractVendorId = (
  customerId: string,
  recipientCompanyId: string
) =>
  recipientCompanyId && recipientCompanyId !== customerId
    ? recipientCompanyId
    : UUIDEnum.None;

const extractRecipientCompanyAndBankAccountFromVendor = (
  company_vendor_partnerships: CompanyVendorPartnerships[] | undefined
) => {
  if (!company_vendor_partnerships || !company_vendor_partnerships[0]) {
    return { recipientCompany: null, advancesBankAccount: null };
  }

  const { vendor, vendor_bank_account } = company_vendor_partnerships[0];

  return { recipientCompany: vendor, advancesBankAccount: vendor_bank_account };
};

const extractRecipientCompanyAndBankAccountFromCustomer = (
  company_by_pk: Companies | undefined
) => {
  if (!company_by_pk) {
    return { recipientCompany: null, advancesBankAccount: null };
  }

  return {
    recipientCompany: company_by_pk,
    advancesBankAccount: company_by_pk.settings?.advances_bank_account,
  };
};

/*
 * Two cases to consider for which bank account is recipient bank account:
 * 1. Purchase order loan: recipient is vendor.
 * 2. Line of credit loan: recipient is customer OR vendor.
 */

export const extractRecipientCompanyIdAndBankAccountFromPartnership = (
  vendorId: string | UUIDEnum.None,
  advancesBankAccountData: GetAdvancesBankAccountsForCustomerQuery | undefined
) => {
  const { companies_by_pk = undefined } = advancesBankAccountData || {};

  return vendorId !== UUIDEnum.None
    ? extractRecipientCompanyAndBankAccountFromVendor(
        companies_by_pk?.company_vendor_partnerships as CompanyVendorPartnerships[]
      )
    : extractRecipientCompanyAndBankAccountFromCustomer(
        companies_by_pk as Companies
      );
};
