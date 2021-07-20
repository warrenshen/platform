import { ContractFragment, ProductTypeEnum } from "generated/graphql";
import { ProductTypeToContractTermsJson } from "lib/enum";

export enum ContractTermConfigs {
  BankDescription = "bank",
  CustomerDescription = "customer",
  IsHiddenIfNull = "is_hidden_if_null",
  DataCy = "data_cy",
}

export enum ContractTermNames {
  DynamicInterestRate = "dynamic_interest_rate",
  FinancingTerms = "contract_financing_terms",
  MaximumAmount = "maximum_amount",
  MinimumMonthlyAmount = "minimum_monthly_amount",
  MinimumQuarterlyAmount = "minimum_quarterly_amount",
  MinimumAnnualAmount = "minimum_annual_amount",
  BorrowingBaseAccountsReceivablePercentage = "borrowing_base_accounts_receivable_percentage",
  BorrowingBaseInventoryPercentage = "borrowing_base_inventory_percentage",
  BorrowingBaseCashPercentage = "borrowing_base_cash_percentage",
  BorrowingBaseCashInDacaPercentage = "borrowing_base_cash_in_daca_percentage",
  AdvanceRate = "advance_rate",
  FactoringFeePercentage = "factoring_fee_percentage",
  FactoringFeeThreshold = "factoring_fee_threshold",
  FactoringFeeThresholdStartingValue = "factoring_fee_threshold_starting_value",
  AdjustedFactoringFeePercentage = "adjusted_factoring_fee_percentage",
  LateFeeStructure = "late_fee_structure",
  WireFee = "wire_fee",
  PrecedingBusinessDay = "preceeding_business_day",
  ClearanceDaysStructure = "repayment_type_settlement_timeline",
  Timezone = "timezone",
  UsState = "us_state",
}

const ContractTermNameToConfigs = {
  [ContractTermNames.FinancingTerms]: {
    [ContractTermConfigs.DataCy]: "financing-terms",
    [ContractTermConfigs.BankDescription]: "",
    [ContractTermConfigs.CustomerDescription]: "",
    [ContractTermConfigs.IsHiddenIfNull]: false,
  },
  [ContractTermNames.MaximumAmount]: {
    [ContractTermConfigs.DataCy]: "maximum-amount",
    [ContractTermConfigs.BankDescription]: "",
    [ContractTermConfigs.CustomerDescription]: "",
    [ContractTermConfigs.IsHiddenIfNull]: false,
  },
  [ContractTermNames.MinimumMonthlyAmount]: {
    [ContractTermConfigs.DataCy]: "minimum-monthly-amount",
    [ContractTermConfigs.BankDescription]:
      "ONLY ONE of minimum monthly, quarterly, or annual amount may have a value (leave the other two fields blank)",
    [ContractTermConfigs.CustomerDescription]: "",
    [ContractTermConfigs.IsHiddenIfNull]: true,
  },
  [ContractTermNames.MinimumQuarterlyAmount]: {
    [ContractTermConfigs.DataCy]: "minimum-quarterly-amount",
    [ContractTermConfigs.BankDescription]:
      "ONLY ONE of minimum monthly, quarterly, or annual amount may have a value (leave the other two fields blank)",
    [ContractTermConfigs.CustomerDescription]: "",
    [ContractTermConfigs.IsHiddenIfNull]: true,
  },
  [ContractTermNames.MinimumAnnualAmount]: {
    [ContractTermConfigs.DataCy]: "minimum-annual-amount",
    [ContractTermConfigs.BankDescription]:
      "ONLY ONE of minimum monthly, quarterly, or annual amount may have a value (leave the other two fields blank)",
    [ContractTermConfigs.CustomerDescription]: "",
    [ContractTermConfigs.IsHiddenIfNull]: true,
  },
  [ContractTermNames.BorrowingBaseAccountsReceivablePercentage]: {
    [ContractTermConfigs.DataCy]:
      "borrowing-base-accounts-receivable-percentage",
    [ContractTermConfigs.BankDescription]: "",
    [ContractTermConfigs.CustomerDescription]:
      "% of AR amount used in determining borrowing base",
    [ContractTermConfigs.IsHiddenIfNull]: true,
  },
  [ContractTermNames.BorrowingBaseInventoryPercentage]: {
    [ContractTermConfigs.DataCy]: "borrowing-base-inventory-percentage",
    [ContractTermConfigs.BankDescription]: "",
    [ContractTermConfigs.CustomerDescription]:
      "% of inventory amount used in determining borrowing base",
    [ContractTermConfigs.IsHiddenIfNull]: true,
  },
  [ContractTermNames.BorrowingBaseCashPercentage]: {
    [ContractTermConfigs.DataCy]: "borrowing-base-cash-percentage",
    [ContractTermConfigs.BankDescription]: "",
    [ContractTermConfigs.CustomerDescription]:
      "% of cash amount in Deposit Accounts used in determining borrowing base",
    [ContractTermConfigs.IsHiddenIfNull]: true,
  },
  [ContractTermNames.BorrowingBaseCashInDacaPercentage]: {
    [ContractTermConfigs.DataCy]: "borrowing-base-cash-in-daca-percentage",
    [ContractTermConfigs.BankDescription]: "",
    [ContractTermConfigs.CustomerDescription]:
      "% of cash amount in DACA Deposit Accounts used in determining borrowing base",
    [ContractTermConfigs.IsHiddenIfNull]: true,
  },
  [ContractTermNames.AdvanceRate]: {
    [ContractTermConfigs.DataCy]: "advance-rate",
    [ContractTermConfigs.BankDescription]: "",
    [ContractTermConfigs.CustomerDescription]:
      "The maximum amount of a PO / Invoice that may be financed",
    [ContractTermConfigs.IsHiddenIfNull]: false,
  },
  [ContractTermNames.DynamicInterestRate]: {
    [ContractTermConfigs.DataCy]: "dynamic-interest-rate",
    [ContractTermConfigs.BankDescription]: "",
    [ContractTermConfigs.CustomerDescription]: "",
    [ContractTermConfigs.IsHiddenIfNull]: true,
  },
  [ContractTermNames.FactoringFeePercentage]: {
    [ContractTermConfigs.DataCy]: "interest-rate",
    [ContractTermConfigs.BankDescription]: "",
    [ContractTermConfigs.CustomerDescription]: "",
    [ContractTermConfigs.IsHiddenIfNull]: true,
  },
  [ContractTermNames.FactoringFeeThreshold]: {
    [ContractTermConfigs.DataCy]: null,
    [ContractTermConfigs.BankDescription]:
      "If customer meets this amount, a reduced interest rate will be used for principal above this amount",
    [ContractTermConfigs.CustomerDescription]: "",
    [ContractTermConfigs.IsHiddenIfNull]: true,
  },
  [ContractTermNames.FactoringFeeThresholdStartingValue]: {
    [ContractTermConfigs.DataCy]: null,
    [ContractTermConfigs.BankDescription]: "",
    [ContractTermConfigs.CustomerDescription]: "",
    [ContractTermConfigs.IsHiddenIfNull]: true,
  },
  [ContractTermNames.AdjustedFactoringFeePercentage]: {
    [ContractTermConfigs.DataCy]: null,
    [ContractTermConfigs.BankDescription]:
      "If customer meets the Volume Discount Threshold, this interest rate will be used",
    [ContractTermConfigs.CustomerDescription]: "",
    [ContractTermConfigs.IsHiddenIfNull]: true,
  },
  [ContractTermNames.LateFeeStructure]: {
    [ContractTermConfigs.DataCy]: "late-fee-structure",
    [ContractTermConfigs.BankDescription]:
      "Example: 1-14: 25%, 15-29: 50%, 30+: 100%",
    [ContractTermConfigs.CustomerDescription]: "",
    [ContractTermConfigs.IsHiddenIfNull]: false,
  },
  [ContractTermNames.WireFee]: {
    [ContractTermConfigs.DataCy]: "wire-fee",
    [ContractTermConfigs.BankDescription]: "",
    [ContractTermConfigs.CustomerDescription]:
      "The amount to be reimbursed by the borrower if payments are sent via wire",
    [ContractTermConfigs.IsHiddenIfNull]: false,
  },
  [ContractTermNames.PrecedingBusinessDay]: {
    [ContractTermConfigs.DataCy]: null,
    [ContractTermConfigs.BankDescription]:
      "versus Succeeding Business Day (for adjusted maturity date)",
    [ContractTermConfigs.CustomerDescription]: "",
    [ContractTermConfigs.IsHiddenIfNull]: true,
  },
  [ContractTermNames.ClearanceDaysStructure]: {
    [ContractTermConfigs.DataCy]: "clearance-days-structure",
    [ContractTermConfigs.BankDescription]: "",
    [ContractTermConfigs.CustomerDescription]:
      "The additional number of days after a payment deposit until the loan is closed",
    [ContractTermConfigs.IsHiddenIfNull]: false,
  },
  [ContractTermNames.Timezone]: {
    [ContractTermConfigs.DataCy]: "timezone",
    [ContractTermConfigs.BankDescription]: "",
    [ContractTermConfigs.CustomerDescription]:
      "Used to determine submission cut-off times for financing requests",
    [ContractTermConfigs.IsHiddenIfNull]: false,
  },
  [ContractTermNames.UsState]: {
    [ContractTermConfigs.DataCy]: "us-state",
    [ContractTermConfigs.BankDescription]: "",
    [ContractTermConfigs.CustomerDescription]: "",
    [ContractTermConfigs.IsHiddenIfNull]: false,
  },
};

export function getContractTermDataCy(contractTermName: ContractTermNames) {
  if (!ContractTermNameToConfigs[contractTermName]) {
    console.error(`Unknown contract term "${contractTermName}", returning "".`);
    return "";
  } else {
    return ContractTermNameToConfigs[contractTermName][
      ContractTermConfigs.DataCy
    ];
  }
}

export function getContractTermBankDescription(
  contractTermName: ContractTermNames
) {
  if (!ContractTermNameToConfigs[contractTermName]) {
    console.error(`Unknown contract term "${contractTermName}", returning "".`);
    return "";
  } else {
    return ContractTermNameToConfigs[contractTermName][
      ContractTermConfigs.BankDescription
    ];
  }
}

export function getContractTermCustomerDescription(
  contractTermName: ContractTermNames
) {
  if (!ContractTermNameToConfigs[contractTermName]) {
    console.error(`Unknown contract term "${contractTermName}", returning "".`);
    return "";
  } else {
    return ContractTermNameToConfigs[contractTermName][
      ContractTermConfigs.CustomerDescription
    ];
  }
}

export function getContractTermIsHiddenIfNull(
  contractTermName: ContractTermNames
) {
  if (!ContractTermNameToConfigs[contractTermName]) {
    console.error(`Unknown contract term "${contractTermName}", returning "".`);
    return "";
  } else {
    return ContractTermNameToConfigs[contractTermName][
      ContractTermConfigs.IsHiddenIfNull
    ];
  }
}

// Contract terms related methods.
export type ProductConfigField = {
  section: string;
  type: string;
  fields?: ProductConfigField[];
  format?: string;
  internal_name: ContractTermNames;
  display_name: string;
  value: any;
  description?: string;
  nullable?: boolean;
  is_hidden?: boolean;
};

export const isProductConfigFieldInvalid = (item: ProductConfigField) => {
  if (item.type === "date") {
    if (!item.value || !item.value.toString().length) {
      return !item.nullable;
    } else {
      return isNaN(Date.parse(item.value));
    }
  } else if (item.type === "float") {
    if (!item.nullable) {
      return item.value === null || !item.value.toString().length;
    }
  } else if (item.type !== "boolean") {
    if (
      [
        ContractTermNames.LateFeeStructure,
        ContractTermNames.ClearanceDaysStructure,
      ].includes(item.internal_name as ContractTermNames)
    ) {
      return item.value === null || !item.value.toString().length;
    } else if (!item.nullable) {
      return !item.value || !item.value.toString().length;
    }
  }
  return false;
};

// The hardcoded `fields[1]` and `fields[2]` are done
// such that we can convert decimal to percentage and
// percentage to decimal in custom "json" type contract
// fields when we de-serialize and serialize contract fields.
//
// Ideally we can remove the use of these hardcoded fields in the future.
const formatValueForClient = (
  type: string,
  value: string | number | null,
  format: string | null,
  fields: ProductConfigField[] | null
) => {
  if (type === "json") {
    if (typeof value !== "string") {
      console.error(
        'Developer error: type is "json" but type of value is not "string".'
      );
      return null;
    }
    if (fields === null || value === null) {
      return value;
    }
    const parsedValue = JSON.parse(value);
    Object.keys(parsedValue).forEach((field) => {
      const value = parsedValue[field] as number;
      if (fields[1]?.format === "percentage") {
        parsedValue[field] = value * 100 <= 100 ? value * 100 : null;
      }
      if (fields[2]?.format === "percentage") {
        parsedValue[field] = value * 100 <= 100 ? value * 100 : null;
      }
    });
    return parsedValue;
  } else if (type === "float") {
    if (value === null) {
      return value;
    }
    const parsedValue = typeof value === "string" ? parseFloat(value) : value;
    if (format === "percentage") {
      const parsedPercent = parsedValue * 100;
      return parsedPercent <= 100 ? parsedPercent : null;
    } else {
      return parsedValue;
    }
  } else if (type === "integer") {
    if (typeof value !== "number") {
      console.error(
        'Developer error: type is "integer" but type of value is not "number".'
      );
      return null;
    }
    return value || null;
  } else {
    return value;
  }
};

const formatValueForServer = (field: ProductConfigField) => {
  const type = field.type;
  const value = field.value;
  const format = field.format || null;
  const fields = field.fields || null;

  // If type is not "json" but type of value is "object", something went wrong.
  if (type !== "json" && value !== null && typeof value === "object") {
    console.error(
      'Developer error: type is not "json" but type of value is "object".'
    );
    return null;
  }

  if (type === "json") {
    if (fields === null || value === null || typeof value !== "object") {
      return value;
    }
    const parsedValue: { [key: string]: any } = {
      ...value,
    };
    Object.keys(parsedValue).forEach((field) => {
      const value = parsedValue[field] as number;
      if (fields[1]?.format === "percentage") {
        parsedValue[field] = value / 100;
      }
      if (fields[2]?.format === "percentage") {
        parsedValue[field] = value / 100;
      }
    });
    return JSON.stringify(parsedValue);
  }

  if (type === "float") {
    return value !== null
      ? parseFloat(value) / (format === "percentage" ? 100 : 1)
      : null;
  } else if (type === "integer") {
    return value ? parseInt(value) : null;
  } else {
    return value;
  }
};

export function createProductConfigFieldsFromProductType(
  productType: ProductTypeEnum
): ProductConfigField[] {
  const templateFields = JSON.parse(ProductTypeToContractTermsJson[productType])
    .v1.fields as ProductConfigField[];
  return templateFields;
}

/**
 *
 */
export function createProductConfigFieldsFromContract(
  contract: ContractFragment
): ProductConfigField[] {
  // Template contract fields based on the JSON template (values are all empty).
  const templateFields = JSON.parse(
    ProductTypeToContractTermsJson[contract.product_type as ProductTypeEnum]
  ).v1.fields as ProductConfigField[];

  // Fill out the template contract fields based on the existing contract.
  if (contract.product_config && Object.keys(contract.product_config).length) {
    const existingFields = contract.product_config.v1.fields;
    existingFields.forEach((existingField: any) => {
      const fieldName = existingField.internal_name;
      const templateField = templateFields.find(
        (templateField: any) => templateField.internal_name === fieldName
      );
      if (
        templateField &&
        (existingField.value !== null || templateField.nullable)
      ) {
        templateField.value = formatValueForClient(
          templateField.type,
          existingField.value,
          templateField.format || null,
          templateField.fields || null
        );
      }
    });
  }

  return templateFields;
}

export function createProductConfigForServer(
  productType: ProductTypeEnum,
  productConfigFields: ProductConfigField[]
): ProductConfigField[] {
  const shortenedJSONConfig = productConfigFields.map(
    (field: ProductConfigField) => ({
      internal_name: field.internal_name,
      value: formatValueForServer(field),
    })
  );
  const currentJSON = JSON.parse(ProductTypeToContractTermsJson[productType]);
  return {
    ...currentJSON,
    v1: {
      ...currentJSON.v1,
      fields: shortenedJSONConfig,
    },
  };
}
