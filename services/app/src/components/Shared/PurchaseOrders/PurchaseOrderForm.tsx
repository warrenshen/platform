import DateFnsUtils from "@date-io/date-fns";
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
} from "@material-ui/core";
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";
import DownloadThumbnail from "components/Shared/File/DownloadThumbnail";
import FileUploadDropzone from "components/Shared/File/UploadDropzone";
import InputCurrencyAutoFormatter from "components/Shared/InputCurrencyAutoFormatter";
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
    dialog: {
      minWidth: "500px",
    },
    dialogTitle: {
      paddingLeft: theme.spacing(4),
      borderBottom: "1px solid #c7c7c7",
    },
    purchaseOrderInput: {
      width: "200px",
    },
    dialogActions: {
      margin: theme.spacing(4),
      marginTop: 0,
      marginBottom: 15,
    },
    submitButton: {
      marginLeft: theme.spacing(1),
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
  purchaseOrderFile: PurchaseOrderFileFragment | undefined;
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
            onChange={({ target: { value } }) => {
              setPurchaseOrder({
                ...purchaseOrder,
                vendor_id: value as string,
              });
            }}
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
          onChange={({ target: { value } }) => {
            setPurchaseOrder({
              ...purchaseOrder,
              order_number: value,
            });
          }}
        ></TextField>
      </Box>
      <Box>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <KeyboardDatePicker
            className={classes.purchaseOrderInput}
            disableToolbar
            variant="inline"
            format="MM/dd/yyyy"
            margin="normal"
            id="order-date-date-picker"
            label="Order Date"
            value={purchaseOrder.order_date}
            onChange={(value: MaterialUiPickersDate) => {
              setPurchaseOrder({
                ...purchaseOrder,
                order_date: value ? value : new Date().getUTCDate(),
              });
            }}
            KeyboardButtonProps={{
              "aria-label": "change date",
            }}
          />
        </MuiPickersUtilsProvider>
      </Box>
      <Box>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <KeyboardDatePicker
            className={classes.purchaseOrderInput}
            disableToolbar
            variant="inline"
            format="MM/dd/yyyy"
            margin="normal"
            id="delivery-date-date-picker"
            label="Delivery date"
            value={purchaseOrder.delivery_date}
            onChange={(value: MaterialUiPickersDate) => {
              setPurchaseOrder({
                ...purchaseOrder,
                delivery_date: value ? value : new Date().getUTCDate(),
              });
            }}
            KeyboardButtonProps={{
              "aria-label": "change date",
            }}
          />
        </MuiPickersUtilsProvider>
      </Box>
      <Box mt={3}>
        <FormControl fullWidth className={classes.purchaseOrderInput}>
          <InputCurrencyAutoFormatter
            label="Amount"
            defaultValue={purchaseOrder.amount}
            onChange={(value) => {
              setPurchaseOrder({
                ...purchaseOrder,
                amount: value,
              });
            }}
          />
        </FormControl>
      </Box>
      <Box mt={3}>
        {purchaseOrderFile && (
          <Grid item>
            <DownloadThumbnail
              fileIds={[purchaseOrderFile.file_id]}
            ></DownloadThumbnail>
          </Grid>
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
        <Box>
          {purchaseOrderFile
            ? "File is uploaded"
            : "Please upload a file (don't forget to press SAVE)"}
        </Box>
      </Box>
      <Box mt={3}>
        <FormControlLabel
          control={
            <Checkbox
              checked={!!purchaseOrder.is_cannabis}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                setPurchaseOrder({
                  ...purchaseOrder,
                  is_cannabis: event.target.checked,
                });
              }}
              color="primary"
            />
          }
          label={"Order includes cannabis or derivatives"}
        />
      </Box>
      {!!purchaseOrder.is_cannabis && (
        <Box mt={3}>
          {purchaseOrderCannabisFiles.length > 0 && (
            <Grid item>
              <DownloadThumbnail
                fileIds={purchaseOrderCannabisFiles.map(
                  (purchaseOrderFile) => purchaseOrderFile.file_id
                )}
              ></DownloadThumbnail>
            </Grid>
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
          <Box>
            {purchaseOrderFile
              ? `${purchaseOrderCannabisFiles.length} file(s) uploaded`
              : "Please upload file(s) (don't forget to press SAVE)"}
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default PurchaseOrderForm;
