import {
  BespokeCatalogBrands,
  BespokeCatalogSkus,
  MetrcToBespokeCatalogSkus,
} from "generated/graphql";
import {
  CustomMutationResponse,
  authenticatedApi,
  productCatalogRoutes,
} from "lib/api";

export async function getSalesTransactionData(req: any): Promise<any> {
  return authenticatedApi
    .get(productCatalogRoutes.getSalesTransactions, req.variables)
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

export async function getIncomingTransferPackageData(req: any): Promise<any> {
  return authenticatedApi
    .get(productCatalogRoutes.getIncomingTransferPackages, req.variables)
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

export type CreateUpdateBespokeCatalogSkuReq = {
  variables: {
    id: BespokeCatalogSkus["id"];
    sku: BespokeCatalogSkus["sku"];
    brand_id: BespokeCatalogBrands["id"];
    brand_name: string;
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

export type CreateUpdateMetrcToBespokeCatalogSkuReq = {
  variables: {
    bespoke_catalog_sku_id: BespokeCatalogSkus["id"];
    product_name: string;
    product_category_name: string;
    sku_confidence: string;
    brand_confidence: string;
  };
};

export async function createUpdateMetrcToBespokeCatalogSkuMutation(
  req: CreateUpdateMetrcToBespokeCatalogSkuReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(
      productCatalogRoutes.createUpdateMetrcToBespokeCatalogSku,
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
