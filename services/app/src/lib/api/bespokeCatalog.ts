import { AxiosRequestConfig } from "axios";
import {
  BespokeCatalogBrands,
  BespokeCatalogSkuGroups,
  BespokeCatalogSkus,
  BespokeCatalogSkusInsertInput,
  MetrcToBespokeCatalogSkus,
} from "generated/graphql";
import {
  CustomMutationResponse,
  CustomQueryResponse,
  authenticatedApi,
  bespokeCatalogRoutes,
} from "lib/api";

export async function getSalesTransactionData(
  req: AxiosRequestConfig
): Promise<CustomQueryResponse> {
  return authenticatedApi
    .get(bespokeCatalogRoutes.getSalesTransactions, req)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.error("error", error);
        return {
          status: "ERROR",
          msg: "Could not get data",
        };
      }
    );
}

export async function getIncomingTransferPackageData(
  req: AxiosRequestConfig
): Promise<CustomQueryResponse> {
  return authenticatedApi
    .get(bespokeCatalogRoutes.getIncomingTransferPackages, req)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.error("error", error);
        return {
          status: "ERROR",
          msg: "Could not get data",
        };
      }
    );
}

export async function getInventoryPackageData(
  req: AxiosRequestConfig
): Promise<CustomQueryResponse> {
  return authenticatedApi
    .get(bespokeCatalogRoutes.getInventoryPackages, req)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.error("error", error);
        return {
          status: "ERROR",
          msg: "Could not get data",
        };
      }
    );
}

export type CreateUpdateBespokeCatalogBrandReq = {
  variables: {
    id: BespokeCatalogBrands["id"];
    brand_name: BespokeCatalogBrands["brand_name"];
  };
};

export async function createUpdateBespokeCatalogBrandMutation(
  req: CreateUpdateBespokeCatalogBrandReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(bespokeCatalogRoutes.createUpdateBespokeCatalogBrand, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.error(error);
        return {
          status: "ERROR",
          msg: error,
        };
      }
    );
}

export type DeleteBespokeCatalogBrandReq = {
  variables: {
    id: BespokeCatalogBrands["id"];
  };
};

export async function deleteBespokeCatalogBrandMutation(
  req: DeleteBespokeCatalogBrandReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(bespokeCatalogRoutes.deleteBespokeCatalogBrand, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.error(error);
        return {
          status: "ERROR",
          msg: error,
        };
      }
    );
}

export type CreateUpdateBespokeCatalogSkuGroupReq = {
  variables: {
    id: BespokeCatalogSkuGroups["id"];
    sku_group_name: BespokeCatalogSkuGroups["sku_group_name"];
    unit_quantity: BespokeCatalogSkuGroups["unit_quantity"];
    unit_of_measure: BespokeCatalogSkuGroups["unit_of_measure"];
    brand_id: BespokeCatalogBrands["id"];
  };
};

export async function createUpdateBespokeCatalogSkuGroupMutation(
  req: CreateUpdateBespokeCatalogSkuGroupReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(
      bespokeCatalogRoutes.createUpdateBespokeCatalogSkuGroup,
      req.variables
    )
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.error(error);
        return {
          status: "ERROR",
          msg: error,
        };
      }
    );
}

export type DeleteBespokeCatalogSkuGroupReq = {
  variables: {
    id: BespokeCatalogBrands["id"];
  };
};

export async function deleteBespokeCatalogSkuGroupMutation(
  req: DeleteBespokeCatalogSkuGroupReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(bespokeCatalogRoutes.deleteBespokeCatalogSkuGroup, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.error(error);
        return {
          status: "ERROR",
          msg: error,
        };
      }
    );
}

export type CreateUpdateBespokeCatalogSkuReq = {
  variables: {
    id: BespokeCatalogSkus["id"];
    sku: BespokeCatalogSkus["sku"];
    bespoke_catalog_sku_group_id: BespokeCatalogSkuGroups["id"];
  };
};

export async function createUpdateBespokeCatalogSkuMutation(
  req: CreateUpdateBespokeCatalogSkuReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(bespokeCatalogRoutes.createUpdateBespokeCatalogSku, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.error(error);
        return {
          status: "ERROR",
          msg: error,
        };
      }
    );
}

export type DeleteBespokeCatalogSkuReq = {
  variables: {
    id: BespokeCatalogSkus["id"];
  };
};

export async function deleteBespokeCatalogSkuMutation(
  req: DeleteBespokeCatalogSkuReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(bespokeCatalogRoutes.deleteBespokeCatalogSku, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.error(error);
        return {
          status: "ERROR",
          msg: error,
        };
      }
    );
}

export type CreateMetrcToBespokeCatalogSkuReq = {
  variables: {
    bespoke_catalog_sku_id: BespokeCatalogSkus["id"];
    bespoke_catalog_sku: BespokeCatalogSkusInsertInput;
    bespoke_name: string;
    bespoke_category_name: string;
    wholesale_quantity: number;
    is_sample: boolean;
    sku_confidence: string;
    brand_confidence: string;
  };
};

export async function createMetrcToBespokeCatalogSkuMutation(
  req: CreateMetrcToBespokeCatalogSkuReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(bespokeCatalogRoutes.createMetrcToBespokeCatalogSku, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.error(error);
        return {
          status: "ERROR",
          msg: error,
        };
      }
    );
}

type InvalidMetrcToBespokeCatalogSku = {
  bespoke_name: string;
  bespoke_category_name: string;
  sku_confidence: string;
};

export type InvalidMetrcToBespokeCatalogSkuReq = {
  variables: {
    invalid_entries: InvalidMetrcToBespokeCatalogSku[];
  };
};

export async function createInvalidMetrcToBespokeCatalogSkuMutation(
  req: InvalidMetrcToBespokeCatalogSkuReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(bespokeCatalogRoutes.invalidMetrcToBespokeCatalogSku, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.error(error);
        return {
          status: "ERROR",
          msg: error,
        };
      }
    );
}

export type SampleMetrcToBespokeCatalogSkuReq = {
  variables: {
    sample_entries: InvalidMetrcToBespokeCatalogSku[];
  };
};

export async function createSampleMetrcToBespokeCatalogSkuMutation(
  req: SampleMetrcToBespokeCatalogSkuReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(bespokeCatalogRoutes.sampleMetrcToBespokeCatalogSku, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.error(error);
        return {
          status: "ERROR",
          msg: error,
        };
      }
    );
}

export type UpdateMetrcToBespokeCatalogSkuReq = {
  variables: {
    bespoke_catalog_sku_id: BespokeCatalogSkus["id"];
    sku_confidence: string;
  };
};

export async function updateMetrcToBespokeCatalogSkuMutation(
  req: UpdateMetrcToBespokeCatalogSkuReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(bespokeCatalogRoutes.updateMetrcToBespokeCatalogSku, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.error(error);
        return {
          status: "ERROR",
          msg: error,
        };
      }
    );
}

export type DeleteMetrcToBespokeCatalogSkuReq = {
  variables: {
    id: MetrcToBespokeCatalogSkus["id"];
  };
};

export async function deleteMetrcToBespokeCatalogSkuMutation(
  req: DeleteMetrcToBespokeCatalogSkuReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(bespokeCatalogRoutes.deleteMetrcToBespokeCatalogSku, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.error(error);
        return {
          status: "ERROR",
          msg: error,
        };
      }
    );
}
