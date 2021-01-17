import DateFnsUtils from "@date-io/date-fns";
import {
  Box,
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
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
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  ListPurchaseOrdersDocument,
  PurchaseOrderFragment,
  PurchaseOrdersInsertInput,
  useAddPurchaseOrderMutation,
  useListPurchaseOrderVendorsQuery,
  useUpdatePurchaseOrderMutation,
} from "generated/graphql";
import { Maybe } from "graphql/jsutils/Maybe";
import { ActionType } from "lib/ActionType";
import { useContext, useState } from "react";

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

enum PurchaseOrderStatus {
  Draft = "draft",
  VendorApprovalRequested = "approval_requested",
  ApprovedByVendor = "approved",
  RejectedByVendor = "rejected",
}

interface Props {
  actionType: ActionType;
  originalPurchaseOrder: Maybe<PurchaseOrderFragment>;
  handleClose: () => void;
}

function AddPurchaseOrderModal({
  actionType,
  originalPurchaseOrder,
  handleClose,
}: Props) {
  const classes = useStyles();
  const {
    user: { companyId },
  } = useContext(CurrentUserContext);
  const {
    data: vendorsData,
    loading: getVendorsLoading,
  } = useListPurchaseOrderVendorsQuery();
  const vendors = vendorsData?.vendors;

  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrderFragment>(
    actionType === ActionType.Update && originalPurchaseOrder
      ? originalPurchaseOrder
      : ({
          company_id: companyId,
          vendor_id: "",
        } as PurchaseOrderFragment)
  );
  const [
    addPurchaseOrder,
    { loading: addPurchaseOrderLoading },
  ] = useAddPurchaseOrderMutation();

  const [
    updatePurchaseOrder,
    { loading: updatePurchaseOrderLoading },
  ] = useUpdatePurchaseOrderMutation();

  const isFormValid = !!purchaseOrder.vendor_id;

  return (
    <Dialog
      open
      onClose={handleClose}
      maxWidth="xl"
      classes={{ paper: classes.dialog }}
    >
      <DialogTitle className={classes.dialogTitle}>
        {`${
          actionType === ActionType.Update ? "Edit" : "Create"
        } Purchase Order`}
      </DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column">
          <Box display="flex" flexDirection="row">
            <FormControl className={classes.purchaseOrderInput}>
              <InputLabel id="vendor-select-label">Vendor</InputLabel>
              <Select
                disabled={getVendorsLoading}
                labelId="vendor-select-label"
                id="vendor-select"
                value={purchaseOrder.vendor_id}
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
                {vendors?.map((vendor) => (
                  <MenuItem key={vendor.id} value={vendor.id}>
                    {vendor.name}
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
                value={purchaseOrder.order_date || null}
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
                value={purchaseOrder.delivery_date || null}
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
              <InputLabel htmlFor="standard-adornment-amount">
                Amount
              </InputLabel>
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
                startAdornment={
                  <InputAdornment position="start">$</InputAdornment>
                }
              />
            </FormControl>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          className={classes.submitButton}
          disabled={
            !isFormValid ||
            addPurchaseOrderLoading ||
            updatePurchaseOrderLoading
          }
          onClick={async () => {
            if (actionType === ActionType.Update) {
              await updatePurchaseOrder({
                variables: {
                  id: purchaseOrder.id,
                  purchaseOrder: {
                    delivery_date: purchaseOrder.delivery_date,
                    order_number: purchaseOrder.order_number,
                    order_date: purchaseOrder.order_date,
                    vendor_id: purchaseOrder.vendor_id,
                    amount: purchaseOrder.amount,
                    status: PurchaseOrderStatus.Draft,
                  },
                },
                refetchQueries: [
                  {
                    query: ListPurchaseOrdersDocument,
                    variables: {
                      company_id: companyId,
                    },
                  },
                ],
              });
            } else {
              await addPurchaseOrder({
                variables: {
                  purchase_order: {
                    delivery_date: purchaseOrder.delivery_date,
                    order_date: purchaseOrder.order_date,
                    order_number: purchaseOrder.order_number,
                    vendor_id: purchaseOrder.vendor_id,
                    amount: purchaseOrder.amount,
                    status: String(PurchaseOrderStatus.Draft),
                  } as PurchaseOrdersInsertInput,
                },
                refetchQueries: [
                  {
                    query: ListPurchaseOrdersDocument,
                    variables: {
                      company_id: companyId,
                    },
                  },
                ],
              });
            }
            handleClose();
          }}
          variant="contained"
          color="primary"
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddPurchaseOrderModal;
