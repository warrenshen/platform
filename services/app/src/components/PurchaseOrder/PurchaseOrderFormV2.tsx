import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import CurrencyInput from "components/Shared/FormInputs/CurrencyInput";
import DateInput from "components/Shared/FormInputs/DateInput";
import {
  GetVendorsByPartnerCompanyQuery,
  MetrcTransferFragment,
  PurchaseOrderMetrcTransferFragment,
  PurchaseOrdersInsertInput,
} from "generated/graphql";
import { MetrcTransferPayload } from "lib/api/metrc";

interface Props {
  purchaseOrder: PurchaseOrdersInsertInput;
  selectableMetrcTransfers: NonNullable<
    GetVendorsByPartnerCompanyQuery["companies_by_pk"]
  >["metrc_transfers"];
  selectableVendors: GetVendorsByPartnerCompanyQuery["vendors"];
  selectedMetrcTransfers: MetrcTransferFragment[];
  setPurchaseOrder: (purchaseOrder: PurchaseOrdersInsertInput) => void;
  setPurchaseOrderMetrcTransfers: React.Dispatch<
    React.SetStateAction<PurchaseOrderMetrcTransferFragment[]>
  >;
}

// As of this commit, this form is the version of the "create purchase order"
// form when user creates a purchase order from a Metrc manifest.
export default function PurchaseOrderFormV2({
  purchaseOrder,
  selectableMetrcTransfers,
  selectableVendors,
  selectedMetrcTransfers,
  setPurchaseOrder,
  setPurchaseOrderMetrcTransfers,
}: Props) {
  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" flexDirection="column">
        {selectedMetrcTransfers.map((selectedMetrcTransfer) => (
          <Box>{selectedMetrcTransfer.manifest_number}</Box>
        ))}
        <Autocomplete
          autoHighlight
          id="auto-complete-transfers"
          options={selectableMetrcTransfers}
          getOptionLabel={(metrcTransfer) => {
            const metrcTransferPayload = metrcTransfer.transfer_payload as MetrcTransferPayload;
            return `Manifest #${
              metrcTransfer.manifest_number
            } | Vendor (Shipper) : ${
              metrcTransferPayload.ShipperFacilityName
            } | Created Date: ${
              metrcTransfer.created_date
            } | Package(s) Count: ${
              metrcTransferPayload.PackageCount != null
                ? metrcTransferPayload.PackageCount
                : "Unknown"
            }`;
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select Metrc manifest"
              variant="outlined"
            />
          )}
          onChange={(_event, metrcTransfer) => {
            if (metrcTransfer) {
              setPurchaseOrderMetrcTransfers((purchaseOrderMetrcTransfers) => [
                ...purchaseOrderMetrcTransfers,
                {
                  purchase_order_id: purchaseOrder.id,
                  metrc_transfer_id: metrcTransfer.id,
                } as PurchaseOrderMetrcTransferFragment,
              ]);
            }
          }}
        />
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <FormControl>
          <InputLabel id="vendor-select-label">Vendor</InputLabel>
          <Select
            data-cy={"purchase-order-form-input-vendor"}
            disabled={selectableVendors.length <= 0}
            labelId="vendor-select-label"
            id="vendor-select"
            value={
              selectableVendors.length > 0 ? purchaseOrder.vendor_id || "" : ""
            }
            onChange={({ target: { value } }) =>
              setPurchaseOrder({
                ...purchaseOrder,
                vendor_id: value || null,
              })
            }
          >
            <MenuItem value={""}>
              <em>None</em>
            </MenuItem>
            {selectableVendors.map((vendor, index) => (
              <MenuItem
                data-cy={`purchase-order-form-input-vendor-menu-item-${
                  index + 1
                }`}
                key={vendor.id}
                value={vendor.id}
              >
                {`${vendor.name} ${
                  vendor.company_vendor_partnerships[0]?.approved_at
                    ? "(Approved)"
                    : "(Not approved)"
                }`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <TextField
          data-cy={"purchase-order-form-input-order-number"}
          label="PO Number"
          value={purchaseOrder.order_number || ""}
          onChange={({ target: { value } }) =>
            setPurchaseOrder({
              ...purchaseOrder,
              order_number: value,
            })
          }
        />
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <DateInput
          dataCy={"purchase-order-form-input-order-date"}
          id="order-date-date-picker"
          label="PO Date"
          value={purchaseOrder.order_date}
          onChange={(value) =>
            setPurchaseOrder({
              ...purchaseOrder,
              order_date: value,
            })
          }
        />
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <DateInput
          dataCy={"purchase-order-form-input-delivery-date"}
          id="delivery-date-date-picker"
          label="Delivery date"
          value={purchaseOrder.delivery_date}
          onChange={(value) =>
            setPurchaseOrder({
              ...purchaseOrder,
              delivery_date: value,
            })
          }
        />
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <CurrencyInput
          dataCy={"purchase-order-form-input-amount"}
          label="Amount"
          value={purchaseOrder.amount}
          handleChange={(value) =>
            setPurchaseOrder({
              ...purchaseOrder,
              amount: value,
            })
          }
        />
      </Box>
    </Box>
  );
}
