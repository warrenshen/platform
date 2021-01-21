import DateFnsUtils from "@date-io/date-fns";
import {
  Box,
  Checkbox,
  createStyles,
  FormControl,
  FormControlLabel,
  Input,
  InputAdornment,
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
import FileUploadDropzone from "components/Shared/File/UploadDropzone";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  PurchaseOrderFragment,
  useListVendorsByCompanyQuery,
} from "generated/graphql";
import { ChangeEvent, useContext, useState } from "react";

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

type FileInDB = {
  id: string;
  path: string;
};

interface Props {
  purchaseOrder: PurchaseOrderFragment;
  setPurchaseOrder: (purchaseOrder: PurchaseOrderFragment) => void;
}

function PurchaseOrderForm({ purchaseOrder, setPurchaseOrder }: Props) {
  const classes = useStyles();
  const {
    user: { companyId },
  } = useContext(CurrentUserContext);
  const {
    data,
    loading: isSelectableVendorsLoading,
  } = useListVendorsByCompanyQuery({
    variables: {
      companyId,
    },
  });
  const selectableVendors = data?.vendors;

  const [
    purchaseOrderPrimaryFile,
    setPurchaseOrderPrimaryFile,
  ] = useState<null | FileInDB>(null);
  const [
    purchaseOrderSecondaryFiles,
    setPurchaseOrderSecondaryFiles,
  ] = useState<FileInDB[]>([]);

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" flexDirection="row">
        <FormControl className={classes.purchaseOrderInput}>
          <InputLabel id="vendor-select-label">Vendor</InputLabel>
          <Select
            disabled={isSelectableVendorsLoading}
            labelId="vendor-select-label"
            id="vendor-select"
            value={isSelectableVendorsLoading ? "" : purchaseOrder.vendor_id}
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
            {selectableVendors?.map((vendor) => (
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
          <InputLabel htmlFor="standard-adornment-amount">Amount</InputLabel>
          <Input
            id="standard-adornment-amount"
            value={purchaseOrder.amount}
            type="number"
            onChange={({ target: { value } }) => {
              setPurchaseOrder({
                ...purchaseOrder,
                amount: Number(value),
              });
            }}
            startAdornment={<InputAdornment position="start">$</InputAdornment>}
          />
        </FormControl>
      </Box>
      <Box mt={3}>
        <FileUploadDropzone
          companyId={companyId}
          docType="purchase_order"
          maxFilesAllowed={1}
          onUploadComplete={async (response) => {
            if (!response.succeeded) {
              return;
            }
            const primaryFile = response.files_in_db[0];
            setPurchaseOrderPrimaryFile(primaryFile);
          }}
        ></FileUploadDropzone>
        <Box>
          {purchaseOrderPrimaryFile
            ? "File is uploaded"
            : "Please upload a file (don't forget to press SAVE)"}
        </Box>
      </Box>
      <Box mt={3}>
        <FormControlLabel
          control={
            <Checkbox
              checked={true}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {}}
              color="primary"
            />
          }
          label={"Order includes cannabis or derivatives"}
        />
      </Box>
      <Box mt={3}>
        <FileUploadDropzone
          companyId={companyId}
          docType="purchase_order"
          onUploadComplete={async (response) => {
            if (!response.succeeded) {
              return;
            }
            const { files_in_db: files } = response;
            console.log({ files });
            setPurchaseOrderSecondaryFiles(files);
          }}
        ></FileUploadDropzone>
        <Box>
          {purchaseOrderPrimaryFile
            ? `${purchaseOrderSecondaryFiles.length} file(s) uploaded`
            : "Please upload file(s) (don't forget to press SAVE)"}
        </Box>
      </Box>
    </Box>
  );
}

export default PurchaseOrderForm;
