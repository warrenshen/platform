import {
  Box,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
} from "@material-ui/core";
import FileUploader from "components/Shared/File/FileUploader";
import CurrencyInput from "components/Shared/FormInputs/CurrencyInput";
import DateInput from "components/Shared/FormInputs/DateInput";
import {
  Companies,
  GetArtifactRelationsByCompanyIdQuery,
  PurchaseOrderFileFragment,
  PurchaseOrderFileTypeEnum,
  PurchaseOrdersInsertInput,
} from "generated/graphql";
import { FileTypeEnum } from "lib/enum";
import { useMemo } from "react";
import Autocomplete from "@material-ui/lab/Autocomplete";

interface Props {
  companyId: Companies["id"];
  purchaseOrder: PurchaseOrdersInsertInput;
  purchaseOrderFiles: PurchaseOrderFileFragment[];
  purchaseOrderCannabisFiles: PurchaseOrderFileFragment[];
  selectableVendors: GetArtifactRelationsByCompanyIdQuery["vendors"];
  setPurchaseOrder: (purchaseOrder: PurchaseOrdersInsertInput) => void;
  setPurchaseOrderFiles: (file: PurchaseOrderFileFragment[]) => void;
  setPurchaseOrderCannabisFiles: (files: PurchaseOrderFileFragment[]) => void;
  frozenPurchaseOrderFileIds: string[];
  frozenPurchaseOrderCannabisFileIds: string[];
}

export default function PurchaseOrderForm({
  companyId,
  purchaseOrder,
  purchaseOrderFiles,
  purchaseOrderCannabisFiles,
  selectableVendors,
  setPurchaseOrder,
  setPurchaseOrderFiles,
  setPurchaseOrderCannabisFiles,
  frozenPurchaseOrderFileIds,
  frozenPurchaseOrderCannabisFileIds,
}: Props) {
  const purchaseOrderFileIds = useMemo(
    () =>
      purchaseOrderFiles.map((purchaseOrderFile) => purchaseOrderFile.file_id),
    [purchaseOrderFiles]
  );
  const purchaseOrderCannabisFileIds = useMemo(
    () =>
      purchaseOrderCannabisFiles.map(
        (purchaseOrderFile) => purchaseOrderFile.file_id
      ),
    [purchaseOrderCannabisFiles]
  );

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" flexDirection="column">
        <Autocomplete
          data-cy={"purchase-order-form-input-vendor"}
          autoHighlight
          id="auto-complete-vendor"
          options={selectableVendors}
          getOptionLabel={(vendor) => {
            return `${vendor.name} ${
              !!vendor.company_vendor_partnerships[0]?.approved_at
                ? "[Approved]"
                : "[Not Approved]"
            }`;
          }}
          renderInput={(params) => {
            const vendor = selectableVendors.find(
              (v) => v.id === purchaseOrder.vendor_id
            );
            return (
              <TextField
                {...params}
                label={vendor ? vendor.name : "Vendor"}
                variant="outlined"
              />
            );
          }}
          onChange={(event, newValue) => {
            setPurchaseOrder({
              ...purchaseOrder,
              vendor_id: newValue?.id || null,
            });
          }}
        />
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
      <Box display="flex" flexDirection="column" mt={4}>
        <FormControlLabel
          control={
            <Checkbox
              data-cy={"purchase-order-form-input-is-cannabis"}
              checked={!!purchaseOrder.is_cannabis}
              onChange={(event) =>
                setPurchaseOrder({
                  ...purchaseOrder,
                  is_cannabis: event.target.checked,
                })
              }
              color="primary"
            />
          }
          label={"Does this order include cannabis or derivatives?"}
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
          fileIds={purchaseOrderFileIds}
          frozenFileIds={frozenPurchaseOrderFileIds}
          handleDeleteFileById={(fileId) =>
            setPurchaseOrderFiles(
              purchaseOrderFiles.filter(
                (purchaseOrderFile) => purchaseOrderFile.file_id !== fileId
              )
            )
          }
          handleNewFiles={(files) =>
            setPurchaseOrderFiles([
              ...purchaseOrderFiles,
              ...files.map((file) => ({
                purchase_order_id: purchaseOrder.id,
                file_id: file.id,
                file_type: PurchaseOrderFileTypeEnum.PurchaseOrder,
                file: file,
              })),
            ])
          }
        />
      </Box>
      {!!purchaseOrder.is_cannabis && (
        <Box display="flex" flexDirection="column" mt={4}>
          <Box mb={1}>
            <Typography variant="subtitle1" color="textSecondary">
              Cannabis File Attachments
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Please upload the following types of files: Shipping Manifest,
              Certificate of Analysis.
            </Typography>
          </Box>
          <FileUploader
            companyId={companyId}
            fileType={FileTypeEnum.PURCHASE_ORDER}
            fileIds={purchaseOrderCannabisFileIds}
            frozenFileIds={frozenPurchaseOrderCannabisFileIds}
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
