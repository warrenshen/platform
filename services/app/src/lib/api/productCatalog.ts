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
  productCatalogRoutes,
} from "lib/api";

export async function getSalesTransactionData(
  req: AxiosRequestConfig
): Promise<CustomQueryResponse> {
  return authenticatedApi
    .get(productCatalogRoutes.getSalesTransactions, req)
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
    .get(productCatalogRoutes.getIncomingTransferPackages, req)
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
    .get(productCatalogRoutes.getInventoryPackages, req)
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
    .post(productCatalogRoutes.createUpdateBespokeCatalogBrand, req.variables)
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
    .post(productCatalogRoutes.deleteBespokeCatalogBrand, req.variables)
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
    brand_id: BespokeCatalogBrands["id"];
  };
};

export async function createUpdateBespokeCatalogSkuGroupMutation(
  req: CreateUpdateBespokeCatalogSkuGroupReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(
      productCatalogRoutes.createUpdateBespokeCatalogSkuGroup,
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
    .post(productCatalogRoutes.deleteBespokeCatalogSkuGroup, req.variables)
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
    .post(productCatalogRoutes.createUpdateBespokeCatalogSku, req.variables)
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
    .post(productCatalogRoutes.deleteBespokeCatalogSku, req.variables)
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
    product_name: string;
    product_category_name: string;
    sku_confidence: string;
    brand_confidence: string;
  };
};

export async function createMetrcToBespokeCatalogSkuMutation(
  req: CreateMetrcToBespokeCatalogSkuReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(productCatalogRoutes.createMetrcToBespokeCatalogSku, req.variables)
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
  product_name: string;
  product_category_name: string;
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
    .post(productCatalogRoutes.createMetrcToBespokeCatalogSku, req.variables)
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
    .post(productCatalogRoutes.updateMetrcToBespokeCatalogSku, req.variables)
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
    .post(productCatalogRoutes.deleteMetrcToBespokeCatalogSku, req.variables)
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
