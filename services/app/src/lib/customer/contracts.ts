import {
  Companies,
  ContractFragment,
  Contracts,
  ContractsInsertInput,
  ProductTypeEnum,
} from "generated/graphql";
import { authenticatedApi, contractRoutes } from "lib/api";
import { ProductTypeToContractTermsJson } from "lib/enum";

export type TerminateContractReq = {
  contract_id: Contracts["id"];
  termination_date: Contracts["adjusted_end_date"];
};

export type TerminateContractResp = {
  status: string;
  msg: string;
};

export async function terminateContract(
  req: TerminateContractReq
): Promise<TerminateContractResp> {
  return authenticatedApi
    .post(contractRoutes.terminateContract, req)
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

export type UpdateContractReq = {
  variables: {
    contract_id: Contracts["id"];
    contract_fields: ContractsInsertInput;
  };
};

export type UpdateContractResp = {
  status: string;
  msg: string;
};

export async function updateContractMutation(
  req: UpdateContractReq
): Promise<UpdateContractResp> {
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

export type AddContractReq = {
  company_id: Companies["id"];
  contract_fields: ContractsInsertInput;
};

export type AddContractResp = {
  status: string;
  msg: string;
};

export async function addContract(
  req: AddContractReq
): Promise<AddContractResp> {
  return authenticatedApi
    .post(contractRoutes.addContract, req)
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

export type ProductConfigField = {
  section: string;
  type: string;
  format?: string;
  internal_name: string;
  display_name: string;
  value: any;
  description?: string;
  nullable?: boolean;
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
        templateField.value = existingField.value;
      }
    });
  }

  return templateFields;
}

const formatValue = (type: any, value: any) => {
  switch (type) {
    case "float":
      return parseFloat(value);
    case "integer":
      return parseInt(value);
    case "date":
    case "string":
      return value;
    default:
      return value;
  }
};

export function createProductConfigForServer(
  productType: ProductTypeEnum,
  productConfigFields: ProductConfigField[]
): ProductConfigField[] {
  const shortenedJSONConfig = productConfigFields.map(
    (field: ProductConfigField) => ({
      internal_name: field.internal_name,
      value: formatValue(field.type, field.value),
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
