import { Maybe, OpenLoanForDebtFacilityFragment } from "generated/graphql";
import {
  DayInMilliseconds,
  dateStringPlusXDaysDate,
  parseDateStringServer,
  withinNDaysOfNowOrBefore,
} from "lib/date";
import {
  DebtFacilityCompanyStatusEnum,
  DebtFacilityCompanyStatusToEligibility,
  DebtFacilityStatusEnum,
  DebtFacilityStatusToEligibility,
  LoanPaymentStatusEnum,
  LoanStatusEnum,
  ProductTypeEnum,
} from "lib/enum";
import {
  createLoanCustomerIdentifier,
  createLoanDisbursementIdentifier,
  getAnonymizedShortName,
  getLoanVendorName,
} from "lib/loans";
import { groupBy } from "lodash";

export const anonymizeLoanNames = (
  loans: OpenLoanForDebtFacilityFragment[],
  groupedByCompanyIds: Record<string, OpenLoanForDebtFacilityFragment[]>
): {
  anonymizedCompanyLookup: Record<string, string>;
  anonymizedVendorLookup: Record<string, string>;
} => {
  const groupedByPartnerIds = groupBy(loans, (loan) => {
    return getPartnerId(loan);
  });

  const anonymizedVendorLookup = Object.fromEntries(
    Object.entries(groupedByPartnerIds).map(([partner_id, loans], index) => [
      partner_id,
      partner_id === "None" ? "N/A" : "Vendor" + (index + 1).toString(),
    ])
  );

  const anonymizedCompanyLookup = Object.fromEntries(
    Object.entries(groupedByCompanyIds).map(([company_id, loans], index) => [
      company_id,
      "Company" + (index + 1).toString(),
    ])
  );

  return {
    anonymizedCompanyLookup: anonymizedCompanyLookup,
    anonymizedVendorLookup: anonymizedVendorLookup,
  };
};

export const calculateGrossMarginValue = (
  loan: OpenLoanForDebtFacilityFragment,
  productType: ProductTypeEnum
): number => {
  // NOTE(JR): the finance team would eventually like this to be configurable
  // Waiting for them to decide when/how
  const grossMarginMultiplier =
    productType === ProductTypeEnum.InvoiceFinancing ? 2.0 : 1.5;

  return loan.amount * grossMarginMultiplier;
};

export const countAdvancesSent = (
  loan: OpenLoanForDebtFacilityFragment
): number => {
  if (!!loan.transactions && !!loan?.company?.contract?.product_type) {
    const productType = getProductTypeFromOpenLoanForDebtFacilityFragment(loan);
    if (productType === ProductTypeEnum.LineOfCredit) {
      const filteredTransactions = loan.transactions.filter((transaction) => {
        return (
          parseDateStringServer(transaction.effective_date) <
          parseDateStringServer("2021-11-24")
        );
      });
      return filteredTransactions.length;
    } else {
      const purchaseOrderCount = !!loan.purchase_order ? 1 : 0;
      const invoiceCount = !!loan.invoice ? 1 : 0;

      return purchaseOrderCount + invoiceCount;
    }
  } else {
    return 0;
  }
};

export const determineBorrowerEligibility = (
  loan: OpenLoanForDebtFacilityFragment,
  supportedProductTypes: ProductTypeEnum[],
  productType: ProductTypeEnum
) => {
  const companyLevelEligibility = !!loan.company?.debt_facility_status
    ? DebtFacilityCompanyStatusToEligibility[
        loan.company.debt_facility_status as DebtFacilityCompanyStatusEnum
      ]
    : null;

  const isProductTypeSupported = supportedProductTypes.includes(productType);

  // Company status alone *could* cover the use case here
  // But adding this extra check around future debt facility support will be useful
  // since we don't know a priori what that support will entail
  return companyLevelEligibility === "Waiver"
    ? companyLevelEligibility
    : companyLevelEligibility === "Eligible" && !!isProductTypeSupported
    ? DebtFacilityCompanyStatusToEligibility[
        DebtFacilityCompanyStatusEnum.GoodStanding
      ]
    : DebtFacilityCompanyStatusToEligibility[
        DebtFacilityCompanyStatusEnum.IneligibleForFacility
      ];
};

export const determineIfNewToBalanceSheet = (
  loan: OpenLoanForDebtFacilityFragment
): string => {
  return !!loan.origination_date &&
    withinNDaysOfNowOrBefore(loan.origination_date, 30, true) === true
    ? "Yes"
    : "No";
};

export const determineIfPreviouslyAssigned = (
  loan: OpenLoanForDebtFacilityFragment,
  lastDebtFacilityReportDate: string
): string => {
  const previouslyAssigned = !!loan.loan_report?.debt_facility_added_date
    ? new Date(loan.loan_report?.debt_facility_added_date) <
      new Date(lastDebtFacilityReportDate)
    : false;

  return !!previouslyAssigned ? "Yes" : "No";
};

export const determineLoanEligibility = (
  loan: OpenLoanForDebtFacilityFragment,
  supportedProductTypes: ProductTypeEnum[],
  productType: ProductTypeEnum
) => {
  if (
    !!loan.loan_report?.debt_facility_status &&
    !!loan.company?.debt_facility_status &&
    !!loan?.company?.contract?.product_type
  ) {
    const companyStatus = loan.company
      .debt_facility_status as DebtFacilityCompanyStatusEnum;
    const loanStatus = loan.loan_report
      .debt_facility_status as DebtFacilityStatusEnum;

    /*
      If a company is not in good standing, but the loan has a waiver, then the loan is eligible.
      Otherwise, if the company is not in good standing, then the loan is not eligible
      This was a special case discussed with the finance team

      When a company is in good standing, the loan's eligibility is determined purely by loan status
      and if the debt facility for the report supports that product type

      For LoC customers, since we merge open loans into one blob, we won't have a loan_report, so we
      need to check for their loan status in a separate if blocks
    */
    if (
      productType === ProductTypeEnum.LineOfCredit &&
      (companyStatus === DebtFacilityCompanyStatusEnum.GoodStanding ||
        companyStatus === DebtFacilityCompanyStatusEnum.OnProbation ||
        companyStatus === DebtFacilityCompanyStatusEnum.Waiver)
    ) {
      return "Eligible";
    } else if (productType === ProductTypeEnum.LineOfCredit) {
      return "Ineligible";
    } else if (
      companyStatus !== DebtFacilityCompanyStatusEnum.GoodStanding &&
      companyStatus !== DebtFacilityCompanyStatusEnum.OnProbation &&
      companyStatus !== DebtFacilityCompanyStatusEnum.Waiver
    ) {
      return loanStatus === DebtFacilityStatusEnum.Waiver
        ? "Eligible"
        : "Ineligible";
    } else {
      return supportedProductTypes.includes(productType)
        ? DebtFacilityStatusToEligibility[
            loan.loan_report.debt_facility_status as DebtFacilityStatusEnum
          ]
        : "Ineligible";
    }
  } else {
    return "Ineligible";
  }
};

export const getArtifactDueDate = (
  loan: OpenLoanForDebtFacilityFragment
): Maybe<Date> => {
  const productType = getProductTypeFromOpenLoanForDebtFacilityFragment(loan);

  return !!productType && productType === ProductTypeEnum.LineOfCredit
    ? !!loan?.company?.contract?.end_date
      ? parseDateStringServer(loan.company.contract.end_date)
      : null
    : !!productType && productType === ProductTypeEnum.InvoiceFinancing
    ? !!loan?.invoice?.invoice_due_date
      ? parseDateStringServer(loan.invoice.invoice_due_date)
      : null
    : !!loan?.origination_date && !!loan?.purchase_order?.net_terms
    ? dateStringPlusXDaysDate(
        loan.origination_date,
        loan.purchase_order.net_terms
      )
    : null;
};

interface getCustomerIdentifierProps {
  loan: OpenLoanForDebtFacilityFragment;
  productType: ProductTypeEnum;
  isAnonymized?: boolean;
  anonymizedCompanyLookup?: Record<string, string>;
}

export const getCustomerIdentifier = ({
  loan,
  productType,
  isAnonymized = false,
  anonymizedCompanyLookup = {},
}: getCustomerIdentifierProps): Maybe<string> => {
  return productType === ProductTypeEnum.LineOfCredit
    ? isAnonymized && !!anonymizedCompanyLookup
      ? getAnonymizedShortName(
          anonymizedCompanyLookup[loan.company_id.toString()]
        )
      : loan.company.identifier || null
    : createLoanCustomerIdentifier(
        loan,
        isAnonymized
          ? anonymizedCompanyLookup[loan.company_id.toString()]
          : null
      );
};

export const getCustomerName = (
  loan: OpenLoanForDebtFacilityFragment,
  isAnonymized: boolean,
  anonymizedCompanyLookup: Record<string, string>
): Maybe<string> => {
  return isAnonymized
    ? anonymizedCompanyLookup[loan.company_id.toString()]
    : loan.company.name;
};

export const getDaysPastDue = (
  loan: OpenLoanForDebtFacilityFragment,
  productType: ProductTypeEnum,
  currentDebtFacilityReportDate: string
): number => {
  const currentReportDate = parseDateStringServer(
    currentDebtFacilityReportDate
  );
  const maturityDate = getMaturityDate(loan, productType);

  // adjusted_maturity_date is nullable, while the debt facility report should
  // never pick up a loan without a maturity date, we're taking an extra step here
  // for extra safety in case requirements ever change
  if (!maturityDate) {
    return 0;
  }

  // If the loan is already repaid, then DPD should be zero
  // if it was paid on time, otherwise the days late from
  // when it was paid
  if (!!loan.closed_at && loan.closed_at < currentReportDate.getTime()) {
    // Multiple calls to parseDateStringServer may seem odd, but it strips the timestamp off
    // so I don't have worry about funky edge cases and timezones since
    // we only care about calendar days in PST in this scenario
    const closedDate = parseDateStringServer(
      parseDateStringServer(loan.closed_at).toDateString()
    );

    const daysPaidPastDue =
      closedDate < currentReportDate
        ? Math.floor(
            (closedDate.valueOf() - maturityDate.valueOf()) / DayInMilliseconds
          )
        : Math.floor(
            (currentReportDate.valueOf() - maturityDate.valueOf()) /
              DayInMilliseconds
          );

    return daysPaidPastDue;
  } else {
    const daysPastDue = Math.floor(
      (currentReportDate.valueOf() - maturityDate.valueOf()) / DayInMilliseconds
    );

    return daysPastDue > 0 ? daysPastDue : 0;
  }
};

export const getDaysPastDueBucket = (
  loan: OpenLoanForDebtFacilityFragment,
  productType: ProductTypeEnum,
  currentDebtFacilityReportDate: string
): string => {
  const daysPastDue = getDaysPastDue(
    loan,
    productType,
    currentDebtFacilityReportDate
  );

  if (daysPastDue <= 0) {
    return "Current";
  } else if (daysPastDue >= 1 && daysPastDue <= 15) {
    return "1-15DPD";
  } else if (daysPastDue >= 16 && daysPastDue <= 30) {
    return "16-30DPD";
  } else if (daysPastDue >= 31 && daysPastDue <= 60) {
    return "31-60DPD";
  } else if (daysPastDue >= 61 && daysPastDue <= 90) {
    return "61-90DPD";
  } else if (daysPastDue >= 91 && daysPastDue <= 120) {
    return "91-120DPD";
  } else if (daysPastDue >= 121 && daysPastDue <= 150) {
    return "121-150DPD";
  } else {
    return "151+DPD";
  }
};

export const getDaysUntilMaturity = (
  loan: OpenLoanForDebtFacilityFragment,
  productType: ProductTypeEnum
): Maybe<number> => {
  const maturityDate = getMaturityDate(loan, productType);
  const now = new Date();

  const maturingInDays = !!maturityDate
    ? Math.floor((maturityDate.valueOf() - now.valueOf()) / DayInMilliseconds)
    : -1;

  return maturingInDays > 0 ? maturingInDays : null;
};

export const getDebtFacilityAddedDate = (
  loan: OpenLoanForDebtFacilityFragment
): Maybe<Date> => {
  return !!loan.loan_report?.debt_facility_added_date
    ? parseDateStringServer(loan.loan_report.debt_facility_added_date)
    : null;
};

export const getDebtFacilityName = (
  loan: OpenLoanForDebtFacilityFragment
): string => {
  return !!loan.loan_report?.debt_facility
    ? loan.loan_report?.debt_facility.name
    : "-";
};

export const getDebtFacilityStatus = (
  loan: OpenLoanForDebtFacilityFragment
): Maybe<string> => {
  return !!loan.loan_report?.debt_facility_status
    ? loan.loan_report.debt_facility_status
    : null;
};

export const getFinancingDayLimit = (
  loan: OpenLoanForDebtFacilityFragment,
  productType: ProductTypeEnum
): Maybe<number> => {
  return productType !== ProductTypeEnum.LineOfCredit &&
    !!loan.loan_report?.financing_day_limit
    ? loan.loan_report.financing_day_limit
    : null;
};

export const getFinancingPeriod = (
  loan: OpenLoanForDebtFacilityFragment,
  productType: ProductTypeEnum
): Maybe<number> => {
  return productType !== ProductTypeEnum.LineOfCredit &&
    !!loan.loan_report?.financing_period
    ? loan.loan_report.financing_period
    : null;
};

interface getLoanIdentifierProps {
  loan: OpenLoanForDebtFacilityFragment;
  productType: ProductTypeEnum;
  isAnonymized?: boolean;
  anonymizedCompanyLookup?: Record<string, string>;
}

export const getLoanIdentifier = ({
  loan,
  productType,
  isAnonymized = false,
  anonymizedCompanyLookup = {},
}: getLoanIdentifierProps): Maybe<string> => {
  return productType === ProductTypeEnum.LineOfCredit
    ? "-"
    : createLoanDisbursementIdentifier(
        loan,
        isAnonymized && !!anonymizedCompanyLookup
          ? anonymizedCompanyLookup[loan.company_id.toString()]
          : null
      );
};

export const getMaturityDate = (
  loan: OpenLoanForDebtFacilityFragment,
  productType: ProductTypeEnum
): Maybe<Date> => {
  return productType !== ProductTypeEnum.LineOfCredit &&
    !!loan?.adjusted_maturity_date
    ? parseDateStringServer(loan.adjusted_maturity_date)
    : null;
};

export const getOriginationOrCreatedDate = (
  loan: OpenLoanForDebtFacilityFragment,
  productType: ProductTypeEnum
): Maybe<Date> => {
  return !!productType && productType !== ProductTypeEnum.LineOfCredit
    ? !!loan.purchase_order?.purchase_order_metrc_transfers?.[0]?.metrc_transfer
        ?.created_date
      ? parseDateStringServer(
          loan.purchase_order?.purchase_order_metrc_transfers[0]?.metrc_transfer
            ?.created_date
        )
      : parseDateStringServer(loan.origination_date)
    : null;
};

export const getLoansInfoData = (
  loan: OpenLoanForDebtFacilityFragment,
  productType: ProductTypeEnum,
  loansInfoLookup: Record<string, Record<string, Record<string, string>>>,
  lookupKey: string,
  filterLineOfCredit: boolean = false
): Maybe<number> => {
  if (productType === ProductTypeEnum.LineOfCredit && !!filterLineOfCredit) {
    return null;
  } else if (
    productType === ProductTypeEnum.LineOfCredit &&
    !filterLineOfCredit
  ) {
    const perCompanyLookupInfo = loansInfoLookup[loan.company_id];

    return Object.keys(perCompanyLookupInfo)
      .map((key) => {
        return perCompanyLookupInfo[key].hasOwnProperty(lookupKey)
          ? Number(perCompanyLookupInfo[key][lookupKey])
          : 0;
      })
      .reduce((a, b) => a + b);
  } else {
    const lookupInfo = loansInfoLookup[loan.company_id][loan.id];

    return lookupInfo.hasOwnProperty(lookupKey)
      ? Number(loansInfoLookup[loan.company_id][loan.id][lookupKey])
      : null;
  }
};

export const getLoanMonth = (
  loan: OpenLoanForDebtFacilityFragment
): Maybe<number> => {
  return !!loan.origination_date
    ? parseDateStringServer(loan.origination_date).getMonth()
    : null;
};

export const getLoanYear = (
  loan: OpenLoanForDebtFacilityFragment
): Maybe<number> => {
  return !!loan.origination_date
    ? parseDateStringServer(loan.origination_date).getFullYear()
    : null;
};

export const getPartnerId = (loan: OpenLoanForDebtFacilityFragment): string => {
  const line_of_credit_vendor_id =
    loan?.line_of_credit?.recipient_vendor_id || null;
  const vendor_id = loan?.purchase_order?.vendor_id || null;
  const payor_id = loan?.invoice?.payor_id || null;

  return !!line_of_credit_vendor_id
    ? line_of_credit_vendor_id
    : !!vendor_id
    ? vendor_id
    : !!payor_id
    ? payor_id
    : "None";
};

export const getProductTypeFromOpenLoanForDebtFacilityFragment = (
  loan: OpenLoanForDebtFacilityFragment
): ProductTypeEnum => {
  return !!loan?.company?.most_recent_financial_summary?.[0]?.product_type
    ? (loan.company.most_recent_financial_summary[0]
        .product_type as ProductTypeEnum)
    : ProductTypeEnum.None;
};

export const getRepaymentDate = (
  loan: OpenLoanForDebtFacilityFragment,
  productType: ProductTypeEnum
): Maybe<Date> => {
  return productType !== ProductTypeEnum.LineOfCredit &&
    !!loan?.loan_report?.repayment_date
    ? parseDateStringServer(loan.loan_report.repayment_date)
    : null;
};

export const getVendorName = (
  loan: OpenLoanForDebtFacilityFragment,
  productType: ProductTypeEnum,
  isAnonymized: boolean = false,
  anonymizedVendorLookup: Record<string, string> = {}
): Maybe<string> => {
  return productType === ProductTypeEnum.LineOfCredit
    ? "N/A"
    : isAnonymized && !!anonymizedVendorLookup
    ? anonymizedVendorLookup[getPartnerId(loan).toString()]
    : getLoanVendorName(loan);
};

export const getUSState = (
  loan: OpenLoanForDebtFacilityFragment
): Maybe<string> => {
  return !!loan.company?.state ? loan.company.state : null;
};

export const reduceLineOfCreditLoans = (
  groupedByCompanyIds: Record<string, OpenLoanForDebtFacilityFragment[]>
): OpenLoanForDebtFacilityFragment[] => {
  return Object.entries(groupedByCompanyIds)
    .map(([company_id, loans]) => {
      const isLineOfCredit =
        getProductTypeFromOpenLoanForDebtFacilityFragment(loans[0]) ===
        ProductTypeEnum.LineOfCredit;
      if (isLineOfCredit) {
        const filteredLoans = loans.filter((loan) => {
          return loan["closed_at"] === null;
        });
        return filteredLoans.length > 0
          ? [
              filteredLoans.reduce((a, b) => {
                return {
                  ...a,
                  amount: a.amount + b.amount,
                  origination_date:
                    (parseDateStringServer(a.origination_date) || new Date()) <
                    (parseDateStringServer(b.origination_date) || new Date())
                      ? a.origination_date
                      : b.origination_date,
                  outstanding_fees: a.outstanding_fees + b.outstanding_fees,
                  outstanding_interest:
                    a.outstanding_interest + b.outstanding_interest,
                  outstanding_principal_balance:
                    a.outstanding_principal_balance +
                    b.outstanding_principal_balance,
                  payment_status:
                    a.payment_status === LoanPaymentStatusEnum.PARTIALLY_PAID ||
                    b.payment_status === LoanPaymentStatusEnum.PARTIALLY_PAID
                      ? LoanPaymentStatusEnum.PARTIALLY_PAID
                      : LoanStatusEnum.Funded,
                  transactions: a["transactions"].concat(b["transactions"]),
                } as OpenLoanForDebtFacilityFragment;
              }),
            ]
          : ([] as OpenLoanForDebtFacilityFragment[]);
      } else {
        return loans;
      }
    })
    .reduce((a, b) => {
      return a.concat(b);
    });
};
