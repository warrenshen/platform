import { BespokeCatalogBrands, BespokeCatalogSkus } from "generated/graphql";
import {
  CustomMutationResponse,
  authenticatedApi,
  productCatalogRoutes,
} from "lib/api";

// TODO: set up initial route for https://www.notion.so/bespokefinancial/Set-up-api-server-to-query-Google-BQ-3c2d68dbb7444f8187522bb13e00b0b2
// export async function getBQData(req: any): Promise<any> {
//   return authenticatedApi
//     .get(productCatalogRoutes.viewMetrcData, req.variables)
//     .then((res) => res.data)
//     .then(
//       (res) => res,
//       (error) => {
//         console.log("error", error);
//         return {
//           status: "ERROR",
//           msg: "Could not get data",
//         };
//       }
//     );
// }

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
