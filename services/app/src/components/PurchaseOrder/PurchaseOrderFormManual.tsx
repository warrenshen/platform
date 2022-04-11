import {
  Box,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import PurchaseOrderFormShared from "components/PurchaseOrder/PurchaseOrderFormShared";
import FileUploader from "components/Shared/File/FileUploader";
import {
  Companies,
  GetArtifactRelationsByCompanyIdQuery,
  PurchaseOrderFileFragment,
  PurchaseOrderFileTypeEnum,
  PurchaseOrdersInsertInput,
} from "generated/graphql";
import { FileTypeEnum } from "lib/enum";
import { useMemo } from "react";

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

export default function PurchaseOrderFormManual({
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
      <PurchaseOrderFormShared
        companyId={companyId}
        purchaseOrder={purchaseOrder}
        purchaseOrderFiles={purchaseOrderFiles}
        setPurchaseOrder={setPurchaseOrder}
        setPurchaseOrderFiles={setPurchaseOrderFiles}
        frozenPurchaseOrderFileIds={frozenPurchaseOrderFileIds}
      />
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
      {!!purchaseOrder.is_cannabis && (
        <Box display="flex" flexDirection="column">
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
            dataCy={
              "purchase-order-form-file-uploader-cannabis-file-attachments"
            }
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
    </Box>
  );
}
