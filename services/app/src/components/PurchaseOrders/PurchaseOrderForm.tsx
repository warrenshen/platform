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
import DownloadThumbnail from "components/Shared/File/DownloadThumbnail";
import FileUploadDropzone from "components/Shared/File/UploadDropzone";
import CurrencyInput from "components/Shared/FormInputs/CurrencyInput";
import DatePicker from "components/Shared/FormInputs/DatePicker";
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
  purchaseOrderFile?: PurchaseOrderFileFragment;
  purchaseOrderCannabisFiles: PurchaseOrderFileFragment[];
  vendors: GetVendorsByPartnerCompanyQuery["vendors"];
  setPurchaseOrder: (purchaseOrder: PurchaseOrdersInsertInput) => void;
  setPurchaseOrderFile: (file: PurchaseOrderFileFragment) => void;
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
            {vendors.map((vendor) => (
              <MenuItem key={vendor.id} value={vendor.id}>
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
          label="PO Number"
          value={purchaseOrder.order_number}
          onChange={({ target: { value } }) =>
            setPurchaseOrder({
              ...purchaseOrder,
              order_number: value,
            })
          }
        />
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <DatePicker
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
        <DatePicker
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
        {purchaseOrderFile && (
          <DownloadThumbnail
            fileIds={purchaseOrderFileIds}
            fileType={FileTypeEnum.PURCHASE_ORDER}
          />
        )}
        <Box mt={1}>
          <FileUploadDropzone
            companyId={companyId}
            docType="purchase_order"
            maxFilesAllowed={1}
            onUploadComplete={async (response) => {
              if (!response.succeeded) {
                return;
              }
              const file = response.files_in_db[0];
              setPurchaseOrderFile({
                purchase_order_id: purchaseOrder.id,
                file_id: file.id,
                file_type: PurchaseOrderFileTypeEnum.PurchaseOrder,
                file: file,
              });
            }}
          />
        </Box>
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
          {purchaseOrderCannabisFiles.length > 0 && (
            <DownloadThumbnail
              fileIds={purchaseOrderCannabisFileIds}
              fileType={FileTypeEnum.PURCHASE_ORDER}
            />
          )}
          <Box mt={1}>
            <FileUploadDropzone
              companyId={companyId}
              docType="purchase_order"
              onUploadComplete={async (response) => {
                if (!response.succeeded) {
                  return;
                }
                const { files_in_db: files } = response;
                setPurchaseOrderCannabisFiles(
                  files.map((file) => ({
                    purchase_order_id: purchaseOrder.id,
                    file_id: file.id,
                    file_type: PurchaseOrderFileTypeEnum.Cannabis,
                    file: file,
                  }))
                );
              }}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default PurchaseOrderForm;
