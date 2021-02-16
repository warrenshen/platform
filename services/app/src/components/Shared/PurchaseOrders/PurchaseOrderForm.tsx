import {
  Box,
  Checkbox,
  createStyles,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  TextField,
  Theme,
  Typography,
} from "@material-ui/core";
import CurrencyTextField from "@unicef/material-ui-currency-textfield";
import DatePicker from "components/Shared/Dates/DatePicker";
import DownloadThumbnail from "components/Shared/File/DownloadThumbnail";
import FileUploadDropzone from "components/Shared/File/UploadDropzone";
import {
  CompanyVendorPartnerships,
  PurchaseOrderFileFragment,
  PurchaseOrderFileTypeEnum,
  PurchaseOrdersInsertInput,
  Vendors,
} from "generated/graphql";
import { ChangeEvent } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    purchaseOrderInput: {
      width: "200px",
    },
  })
);

type VendorsByPartnerType = Pick<Vendors, "id"> & {
  company_vendor_partnerships: Pick<
    CompanyVendorPartnerships,
    "id" | "approved_at"
  >[];
} & Pick<Vendors, "id" | "name">;

interface Props {
  companyId: string;
  purchaseOrder: PurchaseOrdersInsertInput;
  purchaseOrderFile?: PurchaseOrderFileFragment;
  purchaseOrderCannabisFiles: PurchaseOrderFileFragment[];
  vendors: VendorsByPartnerType[];
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
  const classes = useStyles();

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" flexDirection="row">
        <FormControl className={classes.purchaseOrderInput}>
          <InputLabel id="vendor-select-label">Vendor</InputLabel>
          <Select
            disabled={vendors.length <= 0}
            labelId="vendor-select-label"
            id="vendor-select"
            value={vendors.length <= 0 ? "" : purchaseOrder.vendor_id}
            onChange={({ target: { value } }) =>
              setPurchaseOrder({
                ...purchaseOrder,
                vendor_id: value as string,
              })
            }
          >
            <MenuItem value="">
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
      <Box mt={2}>
        <TextField
          label="Order Number"
          value={purchaseOrder.order_number}
          onChange={({ target: { value } }) =>
            setPurchaseOrder({
              ...purchaseOrder,
              order_number: value,
            })
          }
        ></TextField>
      </Box>
      <Box>
        <DatePicker
          className={classes.purchaseOrderInput}
          id="order-date-date-picker"
          label="Order Date"
          disablePast
          value={purchaseOrder.order_date}
          onChange={(value) =>
            setPurchaseOrder({
              ...purchaseOrder,
              order_date: value,
            })
          }
        />
      </Box>
      <Box>
        <DatePicker
          className={classes.purchaseOrderInput}
          id="delivery-date-date-picker"
          label="Delivery date"
          disablePast
          value={purchaseOrder.delivery_date}
          onChange={(value) =>
            setPurchaseOrder({
              ...purchaseOrder,
              delivery_date: value,
            })
          }
        />
      </Box>
      <Box mt={3}>
        <FormControl fullWidth className={classes.purchaseOrderInput}>
          <CurrencyTextField
            label="Amount"
            currencySymbol="$"
            outputFormat="string"
            textAlign="left"
            value={purchaseOrder.amount}
            onChange={(_event: any, value: string) =>
              setPurchaseOrder({
                ...purchaseOrder,
                amount: value,
              })
            }
          ></CurrencyTextField>
        </FormControl>
      </Box>
      <Box mt={3}>
        <Box mb={1}>
          <Typography variant="subtitle1" color="textSecondary">
            Purchase Order File Attachment
          </Typography>
        </Box>
        {purchaseOrderFile && (
          <DownloadThumbnail
            fileIds={[purchaseOrderFile.file_id]}
          ></DownloadThumbnail>
        )}
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
        ></FileUploadDropzone>
      </Box>
      <Box mt={2}>
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
          label={"Order includes cannabis or derivatives"}
        />
      </Box>
      {!!purchaseOrder.is_cannabis && (
        <Box mt={2}>
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
              fileIds={purchaseOrderCannabisFiles.map(
                (purchaseOrderFile) => purchaseOrderFile.file_id
              )}
            ></DownloadThumbnail>
          )}
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
          ></FileUploadDropzone>
        </Box>
      )}
    </Box>
  );
}

export default PurchaseOrderForm;
