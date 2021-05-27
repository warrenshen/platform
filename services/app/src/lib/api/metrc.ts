import { authenticatedApi, CustomMutationResponse, metrcRoutes } from "lib/api";

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

//    "CreatedDateTime":"2021-05-24T23:05:36+00:00",
//    "EstimatedDepartureDateTime":"2021-05-24T16:30:00.000",
//    "EstimatedArrivalDateTime":"2021-05-24T19:30:00.000",
//    "ReceivedDateTime":"2021-05-25T17:47:58+00:00",
export type MetrcTransferPayload = {
  ShipperFacilityLicenseNumber: string;
  ShipperFacilityName: string;
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
  ProductCategoryName: string;
  LabTestingState: string;
  ItemCategory: string;
  ItemStrainName: string;
  ItemState: string;
  ReceivedQuantity: string;
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
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not get transfers",
        };
      }
    );
}

export async function addApiKeyMutation(req: {
  variables: {
    company_settings_id: string;
    api_key: string;
  };
}): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(metrcRoutes.addApiKey, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not add api key",
        };
      }
    );
}

export async function viewApiKey(req: {
  variables: {
    metrc_api_key_id: string;
  };
}): Promise<{
  status: string;
  api_key: string;
}> {
  return authenticatedApi
    .post(metrcRoutes.viewApiKey, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not view api key",
        };
      }
    );
}

export async function syncMetrcDataPerCustomer(req: {
  variables: {
    start_date: string;
    end_date: string;
    company_id: string;
  };
}): Promise<{
  status: string;
}> {
  return authenticatedApi
    .post(metrcRoutes.syncMetrcDataPerCustomer, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not sync metrc data per customer",
        };
      }
    );
}

export async function syncMetrcData(req: {
  variables: {
    cur_date: string;
  };
}): Promise<{
  status: string;
}> {
  return authenticatedApi
    .post(metrcRoutes.syncMetrcData, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not sync metrc data",
        };
      }
    );
}
