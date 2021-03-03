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
};

// TODO (warrenshen): remove hardcoded `fields[1]` if possible.
const formatValueForClient = (
  type: string,
  value: string | null,
  format: string | null,
  fields: ProductConfigField[] | null
) => {
  if (type === "json") {
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
    const parsedValue = parseFloat(value);
    if (format === "percentage") {
      const parsedPercent = parsedValue * 100;
      return parsedPercent <= 100 ? parsedPercent : null;
    } else {
      return parsedValue;
    }
  } else if (type === "integer") {
    return value ? parseInt(value) : null;
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
    console.log(
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
