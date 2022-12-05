import {
  CompanyLicenses,
  GetIncomingFromVendorCompanyDeliveriesByCompanyIdQuery,
} from "generated/graphql";
import { CustomMutationResponse, authenticatedApi, metrcRoutes } from "lib/api";

// {
//    "Id":1977406,
//    "ManifestNumber":"0001977406",
//    "ShipmentLicenseType":"Licensed",
//    "ShipperFacilityLicenseNumber":"C11-0000574-LIC",
//    "ShipperFacilityName":"MATADA, LLC",
//    "Name":null,
//    "TransporterFacilityLicenseNumber":"",
//    "TransporterFacilityName":"",
//    "DriverName":"",
//    "DriverOccupationalLicenseNumber":"",
//    "DriverVehicleLicenseNumber":"",
//    "VehicleMake":"",
//    "VehicleModel":"",
//    "VehicleLicensePlateNumber":"",
//    "DeliveryCount":1,
//    "ReceivedDeliveryCount":1,
//    "PackageCount":2,
//    "ReceivedPackageCount":2,
//    "ContainsPlantPackage":false,
//    "ContainsProductPackage":true,
//    "ContainsTradeSample":false,
//    "ContainsDonation":false,
//    "ContainsTestingSample":false,
//    "ContainsProductRequiresRemediation":false,
//    "ContainsRemediatedProductPackage":false,
//    "CreatedDateTime":"2021-05-24T23:05:36+00:00",
//    "CreatedByUserName":"Christian Molidor",
//    "LastModified":"2021-05-25T10:47:58-07:00",
//    "DeliveryId":1978406,
//    "RecipientFacilityLicenseNumber":"C11-0000314-LIC",
//    "RecipientFacilityName":"Med For America Inc.",
//    "ShipmentTypeName":"Transfer",
//    "ShipmentTransactionType":"Standard",
//    "EstimatedDepartureDateTime":"2021-05-24T16:30:00.000",
//    "ActualDepartureDateTime":null,
//    "EstimatedArrivalDateTime":"2021-05-24T19:30:00.000",
//    "ActualArrivalDateTime":null,
//    "DeliveryPackageCount":2,
//    "DeliveryReceivedPackageCount":2,
//    "ReceivedDateTime":"2021-05-25T17:47:58+00:00",
//    "EstimatedReturnDepartureDateTime":null,
//    "ActualReturnDepartureDateTime":null,
//    "EstimatedReturnArrivalDateTime":null,
//    "ActualReturnArrivalDateTime":null
// }
export type MetrcTransferPayload = {
  LastModified: string;
  ShipperFacilityLicenseNumber: string;
  ShipperFacilityName: string;
  RecipientFacilityLicenseNumber: string;
  RecipientFacilityName: string;
  PackageCount: number;
  ShipmentTransactionType: string;
  EstimatedDepartureDateTime: string;
  EstimatedArrivalDateTime: string;
  ReceivedDateTime: string;
};

// {
//    "PackageId":14311173,
//    "PackageLabel":"1A4060300009FD8000002851",
//    "PackageType":"Product",
//    "SourceHarvestNames":"Harvest 17 - GMO x Grape Pie 16Apr21",
//    "SourcePackageLabels":"1A40603000020EC000002989",
//    "ProductName":"GMO x Grape Pie - Bulk",
//    "ProductCategoryName":"Flower",
//    "ItemStrainName":"GMO x Grape Pie",
//    "ItemUnitCbdPercent":null,
//    "ItemUnitCbdContent":null,
//    "ItemUnitCbdContentUnitOfMeasureName":null,
//    "ItemUnitCbdContentDose":null,
//    "ItemUnitCbdContentDoseUnitOfMeasureName":null,
//    "ItemUnitThcPercent":null,
//    "ItemUnitThcContent":null,
//    "ItemUnitThcContentUnitOfMeasureName":null,
//    "ItemUnitThcContentDose":null,
//    "ItemUnitThcContentDoseUnitOfMeasureName":null,
//    "ItemUnitVolume":null,
//    "ItemUnitVolumeUnitOfMeasureName":null,
//    "ItemUnitWeight":null,
//    "ItemUnitWeightUnitOfMeasureName":null,
//    "ItemServingSize":"",
//    "ItemSupplyDurationDays":null,
//    "ItemUnitQuantity":null,
//    "ItemUnitQuantityUnitOfMeasureName":null,
//    "LabTestingState":"NotSubmitted",
//    "ProductionBatchNumber":null,
//    "IsTradeSample":false,
//    "IsTradeSamplePersistent":false,
//    "SourcePackageIsTradeSample":false,
//    "IsDonation":false,
//    "SourcePackageIsDonation":false,
//    "IsTestingSample":false,
//    "ProductRequiresRemediation":false,
//    "ContainsRemediatedProduct":false,
//    "RemediationDate":null,
//    "ShipmentPackageState":"Accepted",
//    "ShippedQuantity":20,
//    "ShippedUnitOfMeasureName":"Pounds",
//    "GrossUnitOfWeightName":null,
//    "ReceivedQuantity":20,
//    "ReceivedUnitOfMeasureName":"Pounds",
//    "DeliveryId":1978406
// }
export type MetrcPackagePayload = {
  SourceHarvestNames: string;
  SourcePackageLabels: string;
  ProductName: string;
  ProductCategoryName: string;
  LabTestingState: string;
  ItemCategory: string;
  ItemStrainName: string;
  ItemState: string;
  ShipmentPackageState: string;
  ShippedQuantity: string;
  ShippedUnitOfMeasureName: string;
  ShipperWholesalePrice: number;
  ReceivedQuantity: string;
  ReceivedUnitOfMeasureName: string;
  ReceiverWholesalePrice: number;
  ItemUnitQuantity: string;
  ItemUnitWeight: string;
  IsTestingSample: string;
};

export type TransferPackage = {
  // Transfer fields.
  transfer_id: string;
  delivery_id: string;
  manifest_number: string;
  origin_license: string;
  origin_facility: string;
  destination_license: string;
  destination_facility: string;
  type: string;

  // Package fields.
  package_id: string;
  package_number: string;
  package_type: string;
  item: string;
  item_category: string;
  item_strain_name: string;
  item_state: string;
  received_quantity: string;
  uom: string;
  item_unit_quantity: string;
  item_unit_weight: string;
  is_testing_sample: string;
};

type MetrcApiKeyLicensePermissions = {
  license_number: string;
  is_harvests_enabled: boolean;
  is_plant_batches_enabled: boolean;
  is_plants_enabled: boolean;
  is_packages_enabled: boolean;
  is_sales_receipts_enabled: boolean;
  is_transfers_enabled: boolean;
};

// MetrcApiKeyLicensePermissions enhanced with information about the
// corresponding cannabis license from the CompanyLicenses table.
type EnhancedMetrcApiKeyLicensePermissions = MetrcApiKeyLicensePermissions & {
  us_state?: CompanyLicenses["us_state"];
  legal_name?: CompanyLicenses["legal_name"];
  license_category?: CompanyLicenses["license_category"];
  license_description?: CompanyLicenses["license_description"];
  license_status?: CompanyLicenses["license_status"];
};

export type EnhancedMetrcApiKeyPermissions =
  EnhancedMetrcApiKeyLicensePermissions[];
export type MetrcApiKeyPermissions = MetrcApiKeyLicensePermissions[];

type GetTransfersReq = {
  variables: {
    license_id: string;
    start_date: string;
    end_date: string;
  };
};

export async function getTransfersMutation(
  req: GetTransfersReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(metrcRoutes.getTransfers, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.error("error", error);
        return {
          status: "ERROR",
          msg: "Could not get transfers",
        };
      }
    );
}

export async function upsertApiKeyMutation(req: {
  variables: {
    company_id: string;
    metrc_api_key_id: string;
    api_key: string;
  };
}): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(metrcRoutes.upsertApiKey, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.error("error", error);
        return {
          status: "ERROR",
          msg: "Could not add api key",
        };
      }
    );
}

export async function refreshMetrcApiKeyPermissionsMutation(req: {
  variables: {
    metrc_api_key_id: string;
  };
}): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(metrcRoutes.refreshMetrcApiKeyPermissions, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.error("error", error);
        return {
          status: "ERROR",
          msg: "Could not refresh Metrc API key permissions",
        };
      }
    );
}

export async function deleteApiKeyMutation(req: {
  variables: {
    company_id: string;
    metrc_api_key_id: string;
  };
}): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(metrcRoutes.deleteApiKey, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.error("error", error);
        return {
          status: "ERROR",
          msg: "Could not delete api key",
        };
      }
    );
}

export async function viewApiKey(req: {
  variables: {
    metrc_api_key_id: string;
  };
}): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(metrcRoutes.viewApiKey, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.error("error", error);
        return {
          status: "ERROR",
          msg: "Could not view api key",
        };
      }
    );
}

export async function downloadMetrcDataAllCompanies(req: {
  variables: {};
}): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(metrcRoutes.downloadMetrcDataAllCompanies, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.error("error", error);
        return {
          status: "ERROR",
          msg: "Could not sync metrc data per customer",
        };
      }
    );
}

export async function downloadMetrcDataForCompany(req: {
  variables: {
    start_date: string;
    end_date: string;
    company_id: string;
    is_sync: boolean;
  };
}): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(metrcRoutes.downloadMetrcDataForCompany, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.error("error", error);
        return {
          status: "ERROR",
          msg: "Could not sync metrc data per customer",
        };
      }
    );
}

export function getCompanyDeliveryVendorDescription(
  companyDelivery: NonNullable<
    GetIncomingFromVendorCompanyDeliveriesByCompanyIdQuery["company_deliveries"]
  >[0]
) {
  const vendor = companyDelivery.vendor || null;
  if (!vendor) {
    return "Not configured yet";
  } else {
    return `${vendor.name} ${
      !!vendor.company_vendor_partnerships[0]?.approved_at
        ? "[Approved]"
        : "[Not Approved]"
    }`;
  }
}
