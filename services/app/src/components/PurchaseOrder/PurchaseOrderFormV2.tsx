import { Box, TextField, Typography } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import FileUploader from "components/Shared/File/FileUploader";
import CurrencyInput from "components/Shared/FormInputs/CurrencyInput";
import DateInput from "components/Shared/FormInputs/DateInput";
import {
  Companies,
  GetVendorsByPartnerCompanyQuery,
  MetrcTransferFragment,
  PurchaseOrderFileFragment,
  PurchaseOrderFileTypeEnum,
  PurchaseOrderMetrcTransferFragment,
  PurchaseOrdersInsertInput,
} from "generated/graphql";
import { MetrcTransferPayload } from "lib/api/metrc";
import { FileTypeEnum } from "lib/enum";
import { useMemo } from "react";
import styled from "styled-components";

const Manifest = styled.div`
  display: flex;

  padding: 12px 12px;
  border: 1px solid rgba(95, 90, 84, 0.1);
  border-radius: 3px;
`;

interface Props {
  companyId: Companies["id"];
  purchaseOrder: PurchaseOrdersInsertInput;
  purchaseOrderFile: PurchaseOrderFileFragment | null;
  selectableMetrcTransfers: NonNullable<
    GetVendorsByPartnerCompanyQuery["companies_by_pk"]
  >["metrc_transfers"];
  selectedMetrcTransfers: MetrcTransferFragment[];
  setPurchaseOrder: (purchaseOrder: PurchaseOrdersInsertInput) => void;
  setPurchaseOrderFile: (file: PurchaseOrderFileFragment | null) => void;
  setPurchaseOrderMetrcTransfers: React.Dispatch<
    React.SetStateAction<PurchaseOrderMetrcTransferFragment[]>
  >;
}

// As of this commit, this form is the version of the "create purchase order"
// form when user creates a purchase order from a Metrc manifest.
export default function PurchaseOrderFormV2({
  companyId,
  purchaseOrder,
  purchaseOrderFile,
  selectableMetrcTransfers,
  selectedMetrcTransfers,
  setPurchaseOrder,
  setPurchaseOrderFile,
  setPurchaseOrderMetrcTransfers,
}: Props) {
  const purchaseOrderFileIds = useMemo(
    () => (purchaseOrderFile ? [purchaseOrderFile.file_id] : []),
    [purchaseOrderFile]
  );

  // TODO(warrenshen): once at least one Metrc transfer is selected, user should
  // only be able to add additional Metrc transfers belonging to the same vendor.
  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" flexDirection="column">
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
              setPurchaseOrder({
                ...purchaseOrder,
                vendor_id: metrcTransfer.vendor_id,
              });
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
        {selectedMetrcTransfers.length > 0 && (
          <Box display="flex" flexDirection="column" mt={2}>
            {selectedMetrcTransfers.map((selectedMetrcTransfer) => (
              <Manifest key={selectedMetrcTransfer.id}>
                <Typography variant="body1">
                  {`Manifest #${selectedMetrcTransfer.manifest_number}`}
                </Typography>
              </Manifest>
            ))}
          </Box>
        )}
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
      <Box display="flex" flexDirection="column" mt={4}>
        <Box mb={1}>
          <Typography variant="subtitle1" color="textSecondary">
            Purchase Order File Attachment
          </Typography>
        </Box>
        <FileUploader
          dataCy={"purchase-order-form-file-uploader-purchase-order-file"}
          companyId={companyId}
          fileType={FileTypeEnum.PURCHASE_ORDER}
          maxFilesAllowed={1}
          fileIds={purchaseOrderFileIds}
          handleDeleteFileById={() => setPurchaseOrderFile(null)}
          handleNewFiles={(files) =>
            setPurchaseOrderFile({
              purchase_order_id: purchaseOrder.id,
              file_id: files[0].id,
              file_type: PurchaseOrderFileTypeEnum.PurchaseOrder,
              file: files[0],
            })
          }
        />
      </Box>
    </Box>
  );
}
