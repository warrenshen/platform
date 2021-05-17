import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@material-ui/core";
import FileUploader from "components/Shared/File/FileUploader";
import CurrencyInput from "components/Shared/FormInputs/CurrencyInput";
import DateInput from "components/Shared/FormInputs/DateInput";
import {
  GetVendorsByPartnerCompanyQuery,
  PurchaseOrderFileFragment,
  PurchaseOrderFileTypeEnum,
  PurchaseOrdersInsertInput,
} from "generated/graphql";
import { FileTypeEnum } from "lib/enum";
import { ChangeEvent, useMemo } from "react";

interface Props {
  companyId: string;
  purchaseOrder: PurchaseOrdersInsertInput;
  purchaseOrderFile: PurchaseOrderFileFragment | null;
  purchaseOrderCannabisFiles: PurchaseOrderFileFragment[];
  vendors: GetVendorsByPartnerCompanyQuery["vendors"];
  setPurchaseOrder: (purchaseOrder: PurchaseOrdersInsertInput) => void;
  setPurchaseOrderFile: (file: PurchaseOrderFileFragment | null) => void;
  setPurchaseOrderCannabisFiles: (files: PurchaseOrderFileFragment[]) => void;
}

function PurchaseOrderForm({
  companyId,
  purchaseOrder,
  purchaseOrderFile,
  purchaseOrderCannabisFiles,
  vendors,
  setPurchaseOrder,
  setPurchaseOrderFile,
  setPurchaseOrderCannabisFiles,
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

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" flexDirection="column">
        <FormControl>
          <InputLabel id="vendor-select-label">Vendor</InputLabel>
          <Select
            data-cy={"purchase-order-form-input-vendor"}
            disabled={vendors.length <= 0}
            labelId="vendor-select-label"
            id="vendor-select"
            value={vendors.length > 0 ? purchaseOrder.vendor_id || "" : ""}
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
            {vendors.map((vendor, index) => (
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
      <Box display="flex" flexDirection="column" mt={4}>
        <FormControlLabel
          control={
            <Checkbox
              data-cy={"purchase-order-form-input-is-cannabis"}
              checked={!!purchaseOrder.is_cannabis}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
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
      {!!purchaseOrder.is_cannabis && (
        <Box display="flex" flexDirection="column" mt={4}>
          <Box mb={1}>
            <Typography variant="subtitle1" color="textSecondary">
              Cannabis File Attachments
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Please upload the following: Shipping Manifest, Certificate of
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
    </Box>
  );
}

export default PurchaseOrderForm;
