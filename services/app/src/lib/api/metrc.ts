import { authenticatedApi, CustomMutationResponse, metrcRoutes } from "lib/api";

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
