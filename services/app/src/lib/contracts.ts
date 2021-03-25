export enum ContractTermDescriptions {
  Bank = "bank",
  Customer = "customer",
}

export enum ContractTermNames {
  FinancingTerms = "contract_financing_terms",
  MaximumAmount = "maximum_amount",
  MinimumMonthlyAmount = "minimum_monthly_amount",
  BorrowingBaseAccountsReceivablePercentage = "borrowing_base_accounts_receivable_percentage",
  BorrowingBaseInventoryPercentage = "borrowing_base_inventory_percentage",
  BorrowingBaseCashPercentage = "borrowing_base_cash_percentage",
  AdvanceRate = "advance_rate",
  FactoringFeePercentage = "factoring_fee_percentage",
  FactoringFeeThreshold = "factoring_fee_threshold",
  AdjustedFactoringFeePercentage = "adjusted_factoring_fee_percentage",
  LateFeeStructure = "late_fee_structure",
  WireFee = "wire_fee",
  PrecedingBusinessDay = "preceeding_business_day",
  ClearanceDaysStructure = "repayment_type_settlement_timeline",
}

export const ContractTermNameToDescriptions = {
  [ContractTermNames.FinancingTerms]: {
    [ContractTermDescriptions.Bank]: "",
    [ContractTermDescriptions.Customer]: "",
  },
  [ContractTermNames.MaximumAmount]: {
    [ContractTermDescriptions.Bank]: "",
    [ContractTermDescriptions.Customer]: "",
  },
  [ContractTermNames.MinimumMonthlyAmount]: {
    [ContractTermDescriptions.Bank]: "",
    [ContractTermDescriptions.Customer]: "",
  },
  [ContractTermNames.BorrowingBaseAccountsReceivablePercentage]: {
    [ContractTermDescriptions.Bank]: "",
    [ContractTermDescriptions.Customer]: "",
  },
  [ContractTermNames.BorrowingBaseInventoryPercentage]: {
    [ContractTermDescriptions.Bank]: "",
    [ContractTermDescriptions.Customer]: "",
  },
  [ContractTermNames.BorrowingBaseCashPercentage]: {
    [ContractTermDescriptions.Bank]: "",
    [ContractTermDescriptions.Customer]: "",
  },
  [ContractTermNames.AdvanceRate]: {
    [ContractTermDescriptions.Bank]: "",
    [ContractTermDescriptions.Customer]:
      "The maximum amount of the PO / Invoice that may be financed",
  },
  [ContractTermNames.FactoringFeePercentage]: {
    [ContractTermDescriptions.Bank]: "",
    [ContractTermDescriptions.Customer]: "",
  },
  [ContractTermNames.FactoringFeeThreshold]: {
    [ContractTermDescriptions.Bank]:
      "Some clients have the ability to have a reduced interest rate if they meet certain requirements/thresholds",
    [ContractTermDescriptions.Customer]: "",
  },
  [ContractTermNames.AdjustedFactoringFeePercentage]: {
    [ContractTermDescriptions.Bank]:
      "If the client meets the new threshold (as defined above) then this interest rate will be used",
    [ContractTermDescriptions.Customer]: "",
  },
  [ContractTermNames.LateFeeStructure]: {
    [ContractTermDescriptions.Bank]:
      "Example: 1-14: 25%, 15-29: 50%, 30+: 100%",
    [ContractTermDescriptions.Customer]: "",
  },
  [ContractTermNames.WireFee]: {
    [ContractTermDescriptions.Bank]:
      "Manually input the dollar amount for wire fees as they can vary. We can define/add fee names and amounts. Can be multiple wire fee types for each client",
    [ContractTermDescriptions.Customer]: "",
  },
  [ContractTermNames.PrecedingBusinessDay]: {
    [ContractTermDescriptions.Bank]:
      "versus Succeeding Business Day (for adjusted maturity date)",
    [ContractTermDescriptions.Customer]: "",
  },
  [ContractTermNames.ClearanceDaysStructure]: {
    [ContractTermDescriptions.Bank]: "",
    [ContractTermDescriptions.Customer]:
      "Clearance days is the number of additional days after a payment's deposit date during which interest is charged.",
  },
};

export function getContractTermCustomerDescription(
  contractTermName: ContractTermNames
) {
  if (!ContractTermNameToDescriptions[contractTermName]) {
    console.error(`Unknown contract term "${contractTermName}", returning "".`);
    return "";
  } else {
    return ContractTermNameToDescriptions[contractTermName][
      ContractTermDescriptions.Customer
    ];
  }
}
