import {
  Companies,
  ContractFragment,
  Contracts,
  ContractsInsertInput,
  ProductTypeEnum,
} from "generated/graphql";
import {
  authenticatedApi,
  contractRoutes,
  CustomMutationResponse,
} from "lib/api";
import { ProductTypeToContractTermsJson } from "lib/enum";

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
    [ContractTermDescriptions.Customer]:
      "% of AR amount used in determining borrowing base",
  },
  [ContractTermNames.BorrowingBaseInventoryPercentage]: {
    [ContractTermDescriptions.Bank]: "",
    [ContractTermDescriptions.Customer]:
      "% of inventory amount used in determining borrowing base",
  },
  [ContractTermNames.BorrowingBaseCashPercentage]: {
    [ContractTermDescriptions.Bank]: "",
    [ContractTermDescriptions.Customer]:
      "% of cash amount in Deposit Accounts used in determining borrowing base",
  },
  [ContractTermNames.BorrowingBaseCashInDacaPercentage]: {
    [ContractTermDescriptions.Bank]: "",
    [ContractTermDescriptions.Customer]:
      "% of cash amount in DACA Deposit Accounts used in determining borrowing base",
  },
  [ContractTermNames.AdvanceRate]: {
    [ContractTermDescriptions.Bank]: "",
    [ContractTermDescriptions.Customer]:
      "The maximum amount of a PO / Invoice that may be financed",
  },
  [ContractTermNames.FactoringFeePercentage]: {
    [ContractTermDescriptions.Bank]: "",
    [ContractTermDescriptions.Customer]: "",
  },
  [ContractTermNames.FactoringFeeThreshold]: {
    [ContractTermDescriptions.Bank]:
      "If customer meets this amount, a reduced interest rate will be used for principal above this amount",
    [ContractTermDescriptions.Customer]: "",
  },
  [ContractTermNames.FactoringFeeThresholdStartingValue]: {
    [ContractTermDescriptions.Bank]: "",
    [ContractTermDescriptions.Customer]: "",
  },
  [ContractTermNames.AdjustedFactoringFeePercentage]: {
    [ContractTermDescriptions.Bank]:
      "If customer meets the Volume Discount Threshold, this interest rate will be used",
    [ContractTermDescriptions.Customer]: "",
  },
  [ContractTermNames.LateFeeStructure]: {
    [ContractTermDescriptions.Bank]:
      "Example: 1-14: 25%, 15-29: 50%, 30+: 100%",
    [ContractTermDescriptions.Customer]: "",
  },
  [ContractTermNames.WireFee]: {
    [ContractTermDescriptions.Bank]: "",
    [ContractTermDescriptions.Customer]:
      "The amount to be reimbursed by the borrower if payments are sent via wire",
  },
  [ContractTermNames.PrecedingBusinessDay]: {
    [ContractTermDescriptions.Bank]:
      "versus Succeeding Business Day (for adjusted maturity date)",
    [ContractTermDescriptions.Customer]: "",
  },
  [ContractTermNames.ClearanceDaysStructure]: {
    [ContractTermDescriptions.Bank]: "",
    [ContractTermDescriptions.Customer]:
      "The additional number of days after a payment deposit until the loan is closed",
  },
};

export function getContractTermBankDescription(
  contractTermName: ContractTermNames
) {
  if (!ContractTermNameToDescriptions[contractTermName]) {
    console.error(`Unknown contract term "${contractTermName}", returning "".`);
    return "";
  } else {
    return ContractTermNameToDescriptions[contractTermName][
      ContractTermDescriptions.Bank
    ];
  }
}

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

export type AddContractReq = {
  variables: {
    company_id: Companies["id"];
    contract_fields: ContractsInsertInput;
  };
};

export async function addContractMutation(
  req: AddContractReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(contractRoutes.addContract, req.variables)
    .then((res) => {
      return res.data;
    })
    .then(
      (response) => {
        return response;
      },
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not add contract",
        };
      }
    );
}

export type UpdateContractReq = {
  variables: {
    contract_id: Contracts["id"];
    contract_fields: ContractsInsertInput;
  };
};

export async function updateContractMutation(
  req: UpdateContractReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(contractRoutes.updateContract, req.variables)
    .then((res) => {
      return res.data;
    })
    .then(
      (response) => {
        return response;
      },
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not update contract",
        };
      }
    );
}

export type TerminateContractReq = {
  variables: {
    contract_id: Contracts["id"];
    termination_date: Contracts["adjusted_end_date"];
  };
};

export async function terminateContractMutation(
  req: TerminateContractReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(contractRoutes.terminateContract, req.variables)
    .then((res) => {
      return res.data;
    })
    .then(
      (response) => {
        return response;
      },
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not terminate contract",
        };
      }
    );
}

// Contract terms related methods.
export type ProductConfigField = {
  section: string;
  type: string;
  fields?: ProductConfigField[];
  format?: string;
  internal_name: string;
  display_name: string;
  value: any;
  description?: string;
  nullable?: boolean;
  is_hidden_if_null?: boolean;
  is_hidden?: boolean;
};

// TODO (warrenshen): remove hardcoded `fields[1]` if possible.
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
      if (fields[1].format === "percentage") {
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

const formatValueForServer = (
  type: string,
  value: any,
  format: string | null,
  fields: ProductConfigField[] | null
) => {
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
      if (fields[1].format === "percentage") {
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
      value: formatValueForServer(
        field.type,
        field.value,
        field.format || null,
        field.fields || null
      ),
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
