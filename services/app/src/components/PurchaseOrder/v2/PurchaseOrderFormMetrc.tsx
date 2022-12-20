import { Box, TextField, Typography } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import PurchaseOrderFormShared from "components/PurchaseOrder/PurchaseOrderFormShared";
import CompanyDeliveryInfoCard from "components/Transfers/CompanyDeliveryInfoCard";
import {
  Companies,
  GetIncomingFromVendorCompanyDeliveriesByCompanyIdQuery,
  PurchaseOrderFileFragment,
  PurchaseOrderMetrcTransferFragment,
  PurchaseOrdersInsertInput,
} from "generated/graphql";
import {
  MetrcTransferPayload,
  getCompanyDeliveryVendorDescription,
} from "lib/api/metrc";
import { formatDateString, formatDatetimeString } from "lib/date";
import { useState } from "react";

interface Props {
  companyId: Companies["id"];
  purchaseOrder: PurchaseOrdersInsertInput;
  purchaseOrderFiles: PurchaseOrderFileFragment[];
  purchaseOrderCannabisFiles: PurchaseOrderFileFragment[];
  selectableCompanyDeliveries: NonNullable<
    GetIncomingFromVendorCompanyDeliveriesByCompanyIdQuery["company_deliveries"]
  >;
  selectedCompanyDeliveries: NonNullable<
    GetIncomingFromVendorCompanyDeliveriesByCompanyIdQuery["company_deliveries"]
  >;
  setPurchaseOrder: (purchaseOrder: PurchaseOrdersInsertInput) => void;
  setPurchaseOrderFiles: (file: PurchaseOrderFileFragment[]) => void;
  setPurchaseOrderCannabisFiles: (files: PurchaseOrderFileFragment[]) => void;
  setPurchaseOrderMetrcTransfers: React.Dispatch<
    React.SetStateAction<PurchaseOrderMetrcTransferFragment[]>
  >;
  frozenPurchaseOrderFileIds: string[];
  frozenPurchaseOrderCannabisFileIds: string[];
}

// As of this commit, this form is the version of the "create purchase order"
// form when user creates a purchase order from a Metrc manifest.
export default function PurchaseOrderFormMetrc({
  companyId,
  purchaseOrder,
  purchaseOrderFiles,
  purchaseOrderCannabisFiles,
  selectableCompanyDeliveries,
  selectedCompanyDeliveries,
  setPurchaseOrder,
  setPurchaseOrderFiles,
  setPurchaseOrderCannabisFiles,
  setPurchaseOrderMetrcTransfers,
  frozenPurchaseOrderFileIds,
  frozenPurchaseOrderCannabisFileIds,
}: Props) {
  const [autocompleteInputValue, setAutocompleteInputValue] = useState("");

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" flexDirection="column">
        <Autocomplete
          autoHighlight
          blurOnSelect // Majority case: only one Metrc manifest for the purchase order
          id="auto-complete-transfers"
          options={selectableCompanyDeliveries}
          inputValue={autocompleteInputValue}
          value={null}
          getOptionLabel={(companyDelivery) => {
            const metrcTransfer = companyDelivery.metrc_transfer;
            const metrcDelivery = companyDelivery.metrc_delivery;
            return `${metrcTransfer.manifest_number} ${
              companyDelivery.vendor?.name || ""
            } ${formatDatetimeString(
              metrcDelivery.received_datetime
            )} ${formatDateString(metrcTransfer.created_date)}`;
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select Metrc manifest"
              variant="outlined"
            />
          )}
          renderOption={(companyDelivery) => {
            const metrcTransfer = companyDelivery.metrc_transfer;
            const metrcDelivery = companyDelivery.metrc_delivery;
            const metrcTransferPayload =
              metrcTransfer.transfer_payload as MetrcTransferPayload;
            return (
              <Box py={0.5}>
                <Typography variant="body1">
                  {`Manifest #${metrcTransfer.manifest_number}`}
                </Typography>
                <Typography variant="body2">
                  {`License from -> to: ${metrcTransfer.shipper_facility_license_number} -> ${metrcDelivery.recipient_facility_license_number}`}
                </Typography>
                <Typography variant="body2">
                  {`Vendor: ${getCompanyDeliveryVendorDescription(
                    companyDelivery
                  )}`}
                </Typography>
                <Typography variant="body2">
                  {`Received at: ${formatDatetimeString(
                    metrcDelivery.received_datetime,
                    true,
                    "Not received yet"
                  )}`}
                </Typography>
                <Typography variant="body2">
                  {`Created date: ${formatDateString(
                    metrcTransfer.created_date
                  )}`}
                </Typography>
                <Typography variant="body2">
                  {`Package(s) count: ${
                    metrcTransferPayload.PackageCount != null
                      ? metrcTransferPayload.PackageCount
                      : "Unknown"
                  }`}
                </Typography>
                <Typography variant="body2">
                  {`Lab results: ${
                    metrcTransfer.lab_results_status || "Unknown"
                  }`}
                </Typography>
              </Box>
            );
          }}
          onChange={(_event, companyDelivery) => {
            if (companyDelivery) {
              const metrcTransfer = companyDelivery.metrc_transfer;
              setPurchaseOrder({
                ...purchaseOrder,
                vendor_id: companyDelivery.vendor_id,
              });
              setPurchaseOrderMetrcTransfers((purchaseOrderMetrcTransfers) => [
                ...purchaseOrderMetrcTransfers,
                {
                  purchase_order_id: purchaseOrder.id,
                  metrc_transfer_id: metrcTransfer.id,
                } as PurchaseOrderMetrcTransferFragment,
              ]);
              setAutocompleteInputValue("");
            }
          }}
          onInputChange={(_event, value) => setAutocompleteInputValue(value)}
        />
        {selectedCompanyDeliveries.length > 0 ? (
          <Box display="flex" flexDirection="column">
            {selectedCompanyDeliveries.map((selectedCompanyDelivery) => (
              <Box key={selectedCompanyDelivery.id} mt={2}>
                <CompanyDeliveryInfoCard
                  companyDeliveryId={selectedCompanyDelivery.id}
                  companyId={companyId}
                  handleClickClose={() =>
                    setPurchaseOrderMetrcTransfers(
                      (purchaseOrderMetrcTransfers) =>
                        purchaseOrderMetrcTransfers.filter(
                          (purchaseOrderMetrcTransfer) =>
                            purchaseOrderMetrcTransfer.metrc_transfer_id !==
                            selectedCompanyDelivery.metrc_transfer.id
                        )
                    )
                  }
                />
              </Box>
            ))}
          </Box>
        ) : (
          <Box mt={1}>
            <Typography variant="body2" color="textSecondary">
              Selectable manifests correspond to Metrc manifests created within
              the last 120 days and from vendors you are partnered with.
            </Typography>
          </Box>
        )}
      </Box>
      <PurchaseOrderFormShared
        companyId={companyId}
        purchaseOrder={purchaseOrder}
        purchaseOrderFiles={purchaseOrderFiles}
        setPurchaseOrder={setPurchaseOrder}
        setPurchaseOrderFiles={setPurchaseOrderFiles}
        frozenPurchaseOrderFileIds={frozenPurchaseOrderFileIds}
      />
    </Box>
  );
}
