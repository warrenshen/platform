import DateFnsUtils from "@date-io/date-fns";
import {
  Box,
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  TextareaAutosize,
  TextField,
  Theme,
} from "@material-ui/core";
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";
// import {
//   CompaniesInsertInput,
//   useRegisterVendorMutation,
// } from "generated/graphql";
import { useEffect, useState } from "react";
import { CURRENCIES, PURCHASE_ORDERS, VENDORS } from "../models/fakeData";
import { PurchaseOrder, PURCHASE_ORDER_EMPTY } from "../models/PurchaseOrder";
import { PurchaseOrderItem } from "../models/PurchaseOrderItem";
import ListPurchaseOrderItems from "./ListPurchaseOrderItems";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialogTitle: {
      margin: theme.spacing(4),
      marginTop: 10,
      marginBottom: 0,
      borderBottom: "1px solid #c7c7c7",
    },
    purchaseOrderInput: {
      width: "100%",
    },
    formControlLeft: {
      flexDirection: "column",
      margin: theme.spacing(1),
      flexGrow: 1,
    },
    formControlRight: {
      flexDirection: "column",
      margin: theme.spacing(1),
      width: "50%",
    },
    dialogActions: {
      margin: theme.spacing(4),
      marginTop: 0,
      marginBottom: 15,
    },
  })
);

interface Props {
  id: string;
  handleClose: () => void;
}

function AddPurchaseOrderModal({ id, handleClose }: Props) {
  const classes = useStyles();
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder>(
    PURCHASE_ORDER_EMPTY
  );
  const handlePurchaseOrderItems = (items: PurchaseOrderItem[]) => {
    setPurchaseOrder({ ...purchaseOrder, items: items });
  };
  useEffect(() => {
    if (id !== "") {
      const purchaseOrderOriginal = PURCHASE_ORDERS.find((po) => po.id === id);
      if (purchaseOrderOriginal) {
        setPurchaseOrder(purchaseOrderOriginal);
      }
    } else {
      setPurchaseOrder(PURCHASE_ORDER_EMPTY);
    }
  }, [id]);
  // const [registerVendor, { loading }] = useRegisterVendorMutation();

  return (
    <Dialog
      open
      onClose={handleClose}
      // className={classes.dialog}
      maxWidth="xl"
    >
      <DialogTitle className={classes.dialogTitle}>
        Create Purchase Order
      </DialogTitle>
      <DialogContent>
        {/* <DialogContentText>
          Please provide details about the purchase order.
        </DialogContentText> */}
        <Box display="flex" flexDirection="column">
          <Box display="flex" flexDirection="row">
            <FormControl className={classes.formControlLeft}>
              <InputLabel id="parent-purchase-order-number-select-label">
                Parent Purchase Order Number
              </InputLabel>
              <Select
                className={classes.purchaseOrderInput}
                labelId="parent-purchase-order-number-select-label"
                id="parent-purchase-order-number-select"
                value={purchaseOrder.parent_purchase_order_id}
                onChange={({ target: { value } }) => {
                  setPurchaseOrder({
                    ...purchaseOrder,
                    parent_purchase_order_id: value as string,
                  });
                }}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {PURCHASE_ORDERS.filter(
                  (po) => po.associatedPurchaseOrderIds.length > 0
                ).map((parentPurchaseOrder) => (
                  <MenuItem
                    key={parentPurchaseOrder.id}
                    value={parentPurchaseOrder.id}
                  >
                    {parentPurchaseOrder.purchase_order_number}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl className={classes.formControlRight}>
              <InputLabel id="vendor-select-label">Vendor</InputLabel>
              <Select
                className={classes.purchaseOrderInput}
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
                {VENDORS.map((vendor) => (
                  <MenuItem key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box display="flex" flexDirection="row">
            <Box flexDirection="column" m={1} flexGrow={1}>
              <TextField
                label="Purchase Order Number"
                className={classes.purchaseOrderInput}
                value={purchaseOrder.purchase_order_number}
                onChange={({ target: { value } }) => {
                  setPurchaseOrder({
                    ...purchaseOrder,
                    purchase_order_number: value,
                  });
                }}
              ></TextField>
            </Box>
            <FormControl className={classes.formControlRight}>
              <InputLabel id="currency-select-label">Currency</InputLabel>
              <Select
                className={classes.purchaseOrderInput}
                labelId="currency-select-label"
                id="currency-select"
                value={purchaseOrder.currency}
                onChange={({ target: { value } }) => {
                  setPurchaseOrder({
                    ...purchaseOrder,
                    currency: value as string,
                  });
                }}
              >
                {CURRENCIES.map((currency) => (
                  <MenuItem key={currency.value} value={currency.value}>
                    {currency.value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box display="flex" flexDirection="row">
            <Box flexDirection="column" m={1} flexGrow={1}>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardDatePicker
                  className={classes.purchaseOrderInput}
                  disableToolbar
                  variant="inline"
                  format="MM/dd/yyyy"
                  margin="normal"
                  id="created-at-date-picker"
                  label="PO Date"
                  value={purchaseOrder.created_at}
                  onChange={(value: MaterialUiPickersDate) => {
                    setPurchaseOrder({
                      ...purchaseOrder,
                      created_at: value ? value : new Date(),
                    });
                  }}
                  KeyboardButtonProps={{
                    "aria-label": "change date",
                  }}
                />
              </MuiPickersUtilsProvider>
            </Box>
            <Box flexDirection="column" m={1} width="50%">
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
                      delivery_date: value ? value : new Date(),
                    });
                  }}
                  KeyboardButtonProps={{
                    "aria-label": "change date",
                  }}
                />
              </MuiPickersUtilsProvider>
            </Box>
          </Box>
          <Box display="flex" m={1} flexDirection="row">
            <TextareaAutosize
              className={classes.purchaseOrderInput}
              aria-label="Delivery Address"
              placeholder="Delivery Address"
              rowsMin={5}
              onChange={({ target: { value } }) => {
                setPurchaseOrder({
                  ...purchaseOrder,
                  delivery_address: value,
                });
              }}
            />
          </Box>
          <Box display="flex" m={1} flexDirection="row">
            <TextareaAutosize
              id="remarks-text-area"
              className={classes.purchaseOrderInput}
              aria-label="Remarks"
              placeholder="Remarks If any"
              rowsMin={5}
              onChange={({ target: { value } }) => {
                setPurchaseOrder({
                  ...purchaseOrder,
                  remarks: value,
                });
              }}
            />
          </Box>
        </Box>
        <DialogContentText>Description.</DialogContentText>
        <ListPurchaseOrderItems
          purchaseOrderItems={purchaseOrder.items}
          handlePurchaseOrderItems={handlePurchaseOrderItems}
        ></ListPurchaseOrderItems>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Box>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            disabled={
              !purchaseOrder.purchase_order_number && !purchaseOrder.vendor_id
            }
            onClick={() => {
              PURCHASE_ORDERS.push({
                ...purchaseOrder,
                id: "2aa6e053-0e9b-4b1f-b351-2f62f820612f",
                status: "New",
                amount: purchaseOrder.items.reduce(
                  (acc, curr) => (acc += curr.units * curr.pricePerUnit),
                  0
                ),
              });
              // await registerVendor({
              //   variables: {
              //     vendor: {
              //       company_id: "57ee8797-1d5b-4a90-83c9-84c740590e42",
              //       vendor: {
              //         data: purchaseOrder,
              //       },
              //     },
              //   },
              // });
              handleClose();
            }}
            variant="contained"
            color="primary"
          >
            Submit
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default AddPurchaseOrderModal;
