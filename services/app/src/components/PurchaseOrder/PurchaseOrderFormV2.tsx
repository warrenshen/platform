import { Box, TextField, Typography } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import FileUploader from "components/Shared/File/FileUploader";
import CurrencyInput from "components/Shared/FormInputs/CurrencyInput";
import DateInput from "components/Shared/FormInputs/DateInput";
import MetrcTransferInfoCard from "components/Transfers/MetrcTransferInfoCard";
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
import { formatDateString, formatDatetimeString } from "lib/date";
import { FileTypeEnum } from "lib/enum";
import { useMemo, useState } from "react";

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

  const [autocompleteInputValue, setAutocompleteInputValue] = useState("");

  // TODO(warrenshen): once at least one Metrc transfer is selected, user should
  // only be able to add additional Metrc transfers belonging to the same vendor.
  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" flexDirection="column">
        <Autocomplete
          autoHighlight
          blurOnSelect // Majority case: only one Metrc manifest for the purchase order
          id="auto-complete-transfers"
          options={selectableMetrcTransfers}
          inputValue={autocompleteInputValue}
          value={null}
          getOptionLabel={(metrcTransfer) => {
            const metrcTransferPayload = metrcTransfer.transfer_payload as MetrcTransferPayload;
            return `${metrcTransfer.manifest_number} ${
              metrcTransfer.vendor?.name || ""
            } ${formatDatetimeString(
              metrcTransferPayload.ReceivedDateTime
            )} ${formatDateString(metrcTransfer.created_date)}`;
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select Metrc manifest"
              variant="outlined"
            />
          )}
          renderOption={(metrcTransfer) => {
            const metrcTransferPayload = metrcTransfer.transfer_payload as MetrcTransferPayload;
            return (
              <Box py={0.5}>
                <Typography variant="body1">
                  {`Manifest #${metrcTransfer.manifest_number}`}
                </Typography>
                <Typography variant="body2">
                  {`Vendor: ${metrcTransfer.vendor?.name || "Unknown"}`}
                </Typography>
                <Typography variant="body2">
                  {`Received at: ${formatDatetimeString(
                    metrcTransferPayload.ReceivedDateTime
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
              </Box>
            );
          }}
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
              setAutocompleteInputValue("");
            }
          }}
          onInputChange={(_event, value) => setAutocompleteInputValue(value)}
        />
        {selectedMetrcTransfers.length > 0 && (
          <Box display="flex" flexDirection="column">
            {selectedMetrcTransfers.map((selectedMetrcTransfer) => (
              <Box key={selectedMetrcTransfer.id} mt={2}>
                <MetrcTransferInfoCard
                  metrcTransfer={selectedMetrcTransfer}
                  handleClickClose={() =>
                    setPurchaseOrderMetrcTransfers(
                      (purchaseOrderMetrcTransfers) =>
                        purchaseOrderMetrcTransfers.filter(
                          (purchaseOrderMetrcTransfer) =>
                            purchaseOrderMetrcTransfer.metrc_transfer_id !==
                            selectedMetrcTransfer.id
                        )
                    )
                  }
                />
              </Box>
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
