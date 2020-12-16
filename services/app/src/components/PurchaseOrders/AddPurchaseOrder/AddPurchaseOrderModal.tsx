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
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  ListPurchaseOrdersDocument,
  PurchaseOrderFragment,
  PurchaseOrderLineItemsArrRelInsertInput,
  PurchaseOrderLineItemsInsertInput,
  PurchaseOrdersInsertInput,
  useAddPurchaseOrderMutation,
  useListPurchaseOrdersQuery,
  useListPurchaseOrderVendorsQuery,
  useUpdatePurchaseOrderMutation,
} from "generated/graphql";
import { Maybe } from "graphql/jsutils/Maybe";
import { useContext, useState } from "react";
import { ActionType } from "../models/ActionType";
import { CURRENCIES } from "../models/fakeData";
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
  const { company_id: currentUserCompanyId } = useContext(CurrentUserContext);
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrdersInsertInput>(
    {
      id:
        actionType === ActionType.Update
          ? originalPurchaseOrder?.id
          : undefined,
      amount: originalPurchaseOrder?.amount,
      address: originalPurchaseOrder?.address,
      amount_invoiced: originalPurchaseOrder?.amount_invoiced,
      city: originalPurchaseOrder?.city,
      company_id: originalPurchaseOrder?.company_id,
      country: originalPurchaseOrder?.country,
      currency: originalPurchaseOrder?.currency,
      parent_purchase_order_id: originalPurchaseOrder?.parent_purchase_order_id,
      line_items: {
        data: originalPurchaseOrder
          ? originalPurchaseOrder.line_items.map((ppoi) => {
              return {
                item: ppoi.item,
                description: ppoi.description,
                num_units: ppoi.num_units,
                unit: ppoi.unit,
                price_per_unit: ppoi.price_per_unit,
              } as PurchaseOrderLineItemsInsertInput;
            })
          : [],
      },
      purchase_order_number: originalPurchaseOrder
        ? `${actionType === ActionType.Copy ? "Copy of " : ""}${
            originalPurchaseOrder?.purchase_order_number
          }`
        : "",
      remarks: originalPurchaseOrder?.remarks,
      status: originalPurchaseOrder?.status,
      vendor_id: originalPurchaseOrder?.vendor_id,
      zip_code: originalPurchaseOrder?.zip_code,
    }
  );
  const [
    addPurchaseOrder,
    { loading: addPurchaseOrderLoading },
  ] = useAddPurchaseOrderMutation();

  const [
    updatePurchaseOrder,
    { loading: updatePurchaseOrderLoading },
  ] = useUpdatePurchaseOrderMutation();

  const {
    data: vendorsData,
    loading: getVendorsLoading,
  } = useListPurchaseOrderVendorsQuery();
  const vendors = vendorsData?.companies.filter(
    (v) => v.id !== currentUserCompanyId
  );

  const {
    data: parentPurchaseOrdersData,
    loading: getParentPurchaseOrdersLoading,
  } = useListPurchaseOrdersQuery({
    variables: { company_id: currentUserCompanyId },
  });
  const parentPurchaseOrders = parentPurchaseOrdersData?.purchase_orders;
  const handlePurchaseOrderItems = (
    items: PurchaseOrderLineItemsArrRelInsertInput
  ) => {
    setPurchaseOrder({ ...purchaseOrder, line_items: items });
  };

  const isFormValid =
    !!purchaseOrder.purchase_order_number && !!purchaseOrder.vendor_id;

  return (
    <Dialog open onClose={handleClose} maxWidth="xl">
      <DialogTitle className={classes.dialogTitle}>
        {`${
          actionType === ActionType.Update ? "Edit" : "Create"
        } Purchase Order`}
      </DialogTitle>
      <DialogContent>
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
                value={
                  purchaseOrder.parent_purchase_order_id
                    ? purchaseOrder.parent_purchase_order_id
                    : ""
                }
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
                {parentPurchaseOrders?.map((parentPurchaseOrder) => (
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
                value={purchaseOrder.vendor_id ? purchaseOrder.vendor_id : ""}
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
                value={purchaseOrder.currency ? purchaseOrder.currency : "USD"}
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
                  address: value,
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
          purchaseOrderItems={
            purchaseOrder.line_items ? purchaseOrder.line_items : { data: [] }
          }
          handlePurchaseOrderItems={handlePurchaseOrderItems}
        ></ListPurchaseOrderItems>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Box>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            disabled={!isFormValid}
            onClick={async () => {
              if (actionType === ActionType.Update) {
                await updatePurchaseOrder({
                  variables: {
                    id: purchaseOrder.id,
                    purchaseOrder: {
                      purchase_order_number:
                        purchaseOrder.purchase_order_number,
                      address: purchaseOrder.address,
                      amount: purchaseOrder.amount,
                      amount_invoiced: purchaseOrder.amount_invoiced,
                      city: purchaseOrder.city,
                      country: purchaseOrder.country,
                      currency: purchaseOrder.currency,
                      delivery_date: purchaseOrder.delivery_date,
                      parent_purchase_order_id:
                        purchaseOrder.parent_purchase_order_id,
                      remarks: purchaseOrder.remarks,
                      status: purchaseOrder.status,
                      vendor_id: purchaseOrder.vendor_id,
                      zip_code: purchaseOrder.zip_code,
                    },
                    purchaseOrderLineItems: purchaseOrder?.line_items?.data
                      ? purchaseOrder.line_items.data.map((item) => {
                          return {
                            ...item,
                            purchase_order_id: purchaseOrder.id,
                          };
                        })
                      : [],
                  },
                  refetchQueries: [
                    {
                      query: ListPurchaseOrdersDocument,
                      variables: {
                        company_id: currentUserCompanyId,
                      },
                    },
                  ],
                });
              } else {
                await addPurchaseOrder({
                  variables: {
                    purhcase_order: {
                      ...purchaseOrder,
                      company_id: currentUserCompanyId,
                    },
                  },
                  refetchQueries: [
                    {
                      query: ListPurchaseOrdersDocument,
                      variables: {
                        company_id: currentUserCompanyId,
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
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default AddPurchaseOrderModal;
