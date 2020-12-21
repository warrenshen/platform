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
  PurchaseOrderLineItemFragment,
  PurchaseOrderLineItemsArrRelInsertInput,
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
import { ItemAction } from "../models/ItemAction";
import { multiplyNullableNumbers } from "../models/NumberHelper";
import ListPurchaseOrderItems from "./ListPurchaseOrderItems";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialogTitle: {
      paddingLeft: theme.spacing(4),
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
    submitButton: {
      marginLeft: theme.spacing(1),
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
  const parentPurchaseOrders =
    actionType === ActionType.Update
      ? parentPurchaseOrdersData?.purchase_orders.filter(
          (po) => po.id !== originalPurchaseOrder?.id
        )
      : parentPurchaseOrdersData?.purchase_orders;
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrderFragment>(
    actionType === ActionType.Update && originalPurchaseOrder
      ? originalPurchaseOrder
      : ({
          purchase_order_number: "",
          parent_purchase_order_id: "",
          vendor_id: "",
          currency: "USD",
          line_items: [] as PurchaseOrderLineItemFragment[],
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

  const [
    newPurchaseOrderItem,
    setNewPurchaseOrderItem,
  ] = useState<PurchaseOrderLineItemFragment>({
    item: "",
    description: "",
    num_units: 0,
    unit: "",
    price_per_unit: 0,
  } as PurchaseOrderLineItemFragment);

  const handlePurchaseOrderItem = (
    item: PurchaseOrderLineItemFragment,
    action: ItemAction,
    position: number
  ) => {
    var items = purchaseOrder.line_items ? [...purchaseOrder.line_items] : [];
    if (action === ItemAction.Add) {
      items.push(item);
    } else if (action === ItemAction.Remove) {
      items.splice(position, 1);
    } else {
      items[position] = item;
    }
    setPurchaseOrder({
      ...purchaseOrder,
      line_items: [...items],
    });
  };

  const isFormValid =
    !!purchaseOrder.purchase_order_number && !!purchaseOrder.vendor_id;

  if (getVendorsLoading && getParentPurchaseOrdersLoading) {
    return <p>Loading...</p>;
  }
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
                disabled={getParentPurchaseOrdersLoading}
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
                disabled={getVendorsLoading}
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
        <ListPurchaseOrderItems
          newPurchaseOrderItem={newPurchaseOrderItem}
          setNewPurchaseOrderItem={setNewPurchaseOrderItem}
          purchaseOrderItems={purchaseOrder.line_items}
          handlePurchaseOrderItem={handlePurchaseOrderItem}
        ></ListPurchaseOrderItems>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Box>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            className={classes.submitButton}
            disabled={
              !isFormValid ||
              addPurchaseOrderLoading ||
              updatePurchaseOrderLoading
            }
            onClick={async () => {
              var toAddNewItem =
                newPurchaseOrderItem.item &&
                newPurchaseOrderItem.description &&
                newPurchaseOrderItem.num_units &&
                newPurchaseOrderItem.unit &&
                newPurchaseOrderItem.price_per_unit;
              if (actionType === ActionType.Update) {
                const {
                  line_items,
                  vendor,
                  parent_purchase_order,
                  company,
                  id,
                  ...purchaseOrderSet
                } = purchaseOrder;
                await updatePurchaseOrder({
                  variables: {
                    id: purchaseOrder.id,
                    purchaseOrder: {
                      ...purchaseOrderSet,
                      parent_purchase_order_id: purchaseOrderSet.parent_purchase_order_id
                        ? purchaseOrderSet.parent_purchase_order_id
                        : undefined,
                      amount:
                        purchaseOrder?.line_items?.reduce(
                          (acc, cur) =>
                            (acc += multiplyNullableNumbers(
                              cur?.num_units,
                              cur?.price_per_unit
                            )),
                          0
                        ) +
                        (toAddNewItem
                          ? multiplyNullableNumbers(
                              newPurchaseOrderItem.num_units,
                              newPurchaseOrderItem.price_per_unit
                            )
                          : 0),
                    },
                    purchaseOrderLineItems: toAddNewItem
                      ? [
                          ...(line_items
                            ? line_items.map((item) => {
                                return {
                                  ...item,
                                  purchase_order_id: purchaseOrder.id,
                                };
                              })
                            : []),
                          {
                            ...newPurchaseOrderItem,
                            id: undefined,
                            purchase_order_id: purchaseOrder.id,
                          },
                        ]
                      : line_items
                      ? line_items.map((item) => {
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
                const ccc = {
                  data: toAddNewItem
                    ? [
                        ...(purchaseOrder.line_items
                          ? purchaseOrder.line_items
                          : []),
                        { ...newPurchaseOrderItem, id: undefined },
                      ]
                    : purchaseOrder.line_items,
                } as PurchaseOrderLineItemsArrRelInsertInput;
                console.log("ccc", ccc);
                await addPurchaseOrder({
                  variables: {
                    purhcase_order: {
                      ...purchaseOrder,
                      parent_purchase_order_id: purchaseOrder.parent_purchase_order_id
                        ? purchaseOrder.parent_purchase_order_id
                        : undefined,
                      amount:
                        purchaseOrder?.line_items?.reduce(
                          (acc, cur) =>
                            (acc += multiplyNullableNumbers(
                              cur?.num_units,
                              cur?.price_per_unit
                            )),
                          0
                        ) +
                        (toAddNewItem
                          ? multiplyNullableNumbers(
                              newPurchaseOrderItem.num_units,
                              newPurchaseOrderItem.price_per_unit
                            )
                          : 0),
                      company_id: currentUserCompanyId,
                      line_items: {
                        data: toAddNewItem
                          ? [
                              ...(purchaseOrder.line_items
                                ? purchaseOrder.line_items
                                : []),
                              {
                                ...newPurchaseOrderItem,
                                id: undefined,
                                purchase_order_id: purchaseOrder.id,
                              },
                            ]
                          : purchaseOrder.line_items,
                      } as PurchaseOrderLineItemsArrRelInsertInput,
                    } as PurchaseOrdersInsertInput,
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
