import { Box, TextField, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import Autocomplete from "@material-ui/lab/Autocomplete";
import FileUploader from "components/Shared/File/FileUploader";
import CurrencyInput from "components/Shared/FormInputs/CurrencyInput";
import DateInput from "components/Shared/FormInputs/DateInput";
import MetrcTransferInfoCard from "components/Transfers/MetrcTransferInfoCard";
import {
  Companies,
  GetIncomingFromVendorMetrcDeliveriesByCompanyIdQuery,
  MetrcTransferFragment,
  PurchaseOrderFileFragment,
  PurchaseOrderFileTypeEnum,
  PurchaseOrderMetrcTransferFragment,
  PurchaseOrdersInsertInput,
} from "generated/graphql";
import {
  MetrcTransferPayload,
  getMetrcTransferVendorDescription,
} from "lib/api/metrc";
import { formatDateString, formatDatetimeString } from "lib/date";
import { FileTypeEnum } from "lib/enum";
import { useMemo, useState } from "react";

interface Props {
  companyId: Companies["id"];
  purchaseOrder: PurchaseOrdersInsertInput;
  purchaseOrderFile: PurchaseOrderFileFragment | null;
  purchaseOrderCannabisFiles: PurchaseOrderFileFragment[];
  selectableMetrcTransfers: NonNullable<
    GetIncomingFromVendorMetrcDeliveriesByCompanyIdQuery["metrc_deliveries"]
  >[0]["metrc_transfer"][];
  selectedMetrcTransfers: MetrcTransferFragment[];
  setPurchaseOrder: (purchaseOrder: PurchaseOrdersInsertInput) => void;
  setPurchaseOrderFile: (file: PurchaseOrderFileFragment | null) => void;
  setPurchaseOrderCannabisFiles: (files: PurchaseOrderFileFragment[]) => void;
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
  purchaseOrderCannabisFiles,
  selectableMetrcTransfers,
  selectedMetrcTransfers,
  setPurchaseOrder,
  setPurchaseOrderFile,
  setPurchaseOrderCannabisFiles,
  setPurchaseOrderMetrcTransfers,
}: Props) {
  const purchaseOrderFileIds = useMemo(
    () => (purchaseOrderFile ? [purchaseOrderFile.file_id] : []),
    [purchaseOrderFile]
  );
  const purchaseOrderCannabisFileIds = useMemo(
    () =>
      purchaseOrderCannabisFiles.map(
        (purchaseOrderFile) => purchaseOrderFile.file_id
      ),
    [purchaseOrderCannabisFiles]
  );

  const [autocompleteInputValue, setAutocompleteInputValue] = useState("");

  // True if a metrc transfer is selected and its lab results status is "passed".
  const isLabResultsPassed =
    selectedMetrcTransfers.length > 0 &&
    selectedMetrcTransfers[0].lab_results_status === "passed";

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
                  {`License from -> to: ${metrcTransferPayload.ShipperFacilityLicenseNumber} -> ${metrcTransferPayload.RecipientFacilityLicenseNumber}`}
                </Typography>
                <Typography variant="body2">
                  {`Vendor: ${getMetrcTransferVendorDescription(
                    metrcTransfer
                  )}`}
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
                <Typography variant="body2">
                  {`Lab results: ${
                    metrcTransfer.lab_results_status || "Unknown"
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
        {selectedMetrcTransfers.length > 0 ? (
          <Box display="flex" flexDirection="column">
            {selectedMetrcTransfers.map((selectedMetrcTransfer) => (
              <Box key={selectedMetrcTransfer.id} mt={2}>
                <MetrcTransferInfoCard
                  companyId={selectedMetrcTransfer.company_id}
                  metrcTransferId={selectedMetrcTransfer.id}
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
        ) : (
          <Box mt={1}>
            <Typography variant="body2" color="textSecondary">
              Selectable manifests correspond to Metrc transfers created within
              the last 60 days and from vendors you are partnered with
            </Typography>
          </Box>
        )}
      </Box>
      {isLabResultsPassed && (
        <Box display="flex" flexDirection="column" mt={2}>
          <Alert severity="success">
            <Typography variant="body2">
              Since the selected Metrc manifest(s) passed lab tests, you do not
              have to upload Certificate of Analysis (COA) files for this
              purchase order.
            </Typography>
          </Alert>
        </Box>
      )}
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
      {!isLabResultsPassed && (
        <Box display="flex" flexDirection="column" mt={4}>
          <Box mb={1}>
            <Typography variant="subtitle1" color="textSecondary">
              Cannabis File Attachments
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Please upload the following types of file(s): Certificate of
              Analysis.
            </Typography>
          </Box>
          <FileUploader
            companyId={companyId}
            fileType={FileTypeEnum.PURCHASE_ORDER}
            fileIds={purchaseOrderCannabisFileIds}
            handleDeleteFileById={(fileId) =>
              setPurchaseOrderCannabisFiles(
                purchaseOrderCannabisFiles.filter(
                  (purchaseOrderFile) => purchaseOrderFile.file_id !== fileId
                )
              )
            }
            handleNewFiles={(files) =>
              setPurchaseOrderCannabisFiles([
                ...purchaseOrderCannabisFiles,
                ...files.map((file) => ({
                  purchase_order_id: purchaseOrder.id,
                  file_id: file.id,
                  file_type: PurchaseOrderFileTypeEnum.Cannabis,
                  file: file,
                })),
              ])
            }
          />
        </Box>
      )}
      <Box display="flex" flexDirection="column" mt={4}>
        <TextField
          data-cy={"purchase-order-form-input-customer-note"}
          multiline
          label={"Comments"}
          helperText={"Any comments about this purchase order"}
          value={purchaseOrder.customer_note || ""}
          onChange={({ target: { value } }) =>
            setPurchaseOrder({
              ...purchaseOrder,
              customer_note: value,
            })
          }
        />
      </Box>
    </Box>
  );
}
