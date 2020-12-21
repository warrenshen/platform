import {
  Box,
  createStyles,
  IconButton,
  makeStyles,
  TextField,
} from "@material-ui/core";
import Add from "@material-ui/icons/Add";
import { PurchaseOrderLineItemFragment } from "generated/graphql";
import { ItemAction } from "../models/ItemAction";
import { multiplyNullableNumbers } from "../models/NumberHelper";
import PurchaseOrderLineItem from "./PurchaseOrderLineItem";

const useStyles = makeStyles(() =>
  createStyles({
    itemInput: {
      marginRight: "15px",
    },
    itemInputLast: {
      minWidth: 200,
      marginRight: "0",
    },
    itemInputGrandTotal: {
      width: 200,
      marginRight: "48px",
    },
  })
);

interface Props {
  newPurchaseOrderItem: PurchaseOrderLineItemFragment;
  setNewPurchaseOrderItem: (item: PurchaseOrderLineItemFragment) => void;
  purchaseOrderItems: PurchaseOrderLineItemFragment[];
  handlePurchaseOrderItem: (
    item: PurchaseOrderLineItemFragment,
    action: ItemAction,
    position: number
  ) => void;
}

function ListPurchaseOrderItems({
  newPurchaseOrderItem,
  setNewPurchaseOrderItem,
  purchaseOrderItems,
  handlePurchaseOrderItem,
}: Props) {
  const classes = useStyles();
  const isValid =
    newPurchaseOrderItem.item &&
    newPurchaseOrderItem.num_units &&
    newPurchaseOrderItem.description &&
    newPurchaseOrderItem.price_per_unit &&
    newPurchaseOrderItem.price_per_unit;
  return (
    <>
      {purchaseOrderItems?.map((purchaseOrderItem, index) => (
        <PurchaseOrderLineItem
          key={index}
          position={index}
          purchaseOrderItem={purchaseOrderItem}
          handlePurchaseOrderItem={handlePurchaseOrderItem}
        ></PurchaseOrderLineItem>
      ))}
      <Box display="flex" m={1}>
        <TextField
          label="Item"
          className={classes.itemInput}
          value={newPurchaseOrderItem.item}
          onChange={({ target: { value } }) => {
            setNewPurchaseOrderItem({ ...newPurchaseOrderItem, item: value });
          }}
        ></TextField>
        <TextField
          label="Description"
          className={classes.itemInput}
          value={newPurchaseOrderItem.description}
          onChange={({ target: { value } }) => {
            setNewPurchaseOrderItem({
              ...newPurchaseOrderItem,
              description: value,
            });
          }}
        ></TextField>
        <TextField
          label="Units"
          className={classes.itemInput}
          value={newPurchaseOrderItem.num_units}
          onChange={({ target: { value } }) => {
            const u = +value;
            setNewPurchaseOrderItem({
              ...newPurchaseOrderItem,
              num_units: isNaN(u) ? 0 : u,
            });
          }}
        ></TextField>
        <TextField
          label="Unit"
          className={classes.itemInput}
          value={newPurchaseOrderItem.unit}
          onChange={({ target: { value } }) => {
            setNewPurchaseOrderItem({ ...newPurchaseOrderItem, unit: value });
          }}
        ></TextField>
        <TextField
          label="Price Per Unit"
          className={classes.itemInput}
          value={newPurchaseOrderItem.price_per_unit}
          onChange={({ target: { value } }) => {
            const ppU = +value;
            setNewPurchaseOrderItem({
              ...newPurchaseOrderItem,
              price_per_unit: isNaN(ppU) ? 0 : ppU,
            });
          }}
        ></TextField>
        <TextField
          label="Total"
          disabled={true}
          className={classes.itemInputLast}
          value={multiplyNullableNumbers(
            newPurchaseOrderItem.num_units,
            newPurchaseOrderItem.price_per_unit
          )}
        ></TextField>
        <Box>
          <IconButton
            disabled={!isValid}
            onClick={() => {
              handlePurchaseOrderItem(newPurchaseOrderItem, ItemAction.Add, 0);
              setNewPurchaseOrderItem({
                id: 0,
                item: "",
                description: "",
                num_units: 0,
                unit: "",
                price_per_unit: 0,
              });
            }}
            component="span"
            color="primary"
          >
            <Add />
          </IconButton>
        </Box>
      </Box>
      <Box display="flex" justifyContent="flex-end" m={1}>
        <TextField
          label="Total"
          disabled={true}
          className={classes.itemInputGrandTotal}
          value={
            (purchaseOrderItems
              ? purchaseOrderItems.reduce(
                  (acc, curr) =>
                    (acc += multiplyNullableNumbers(
                      curr.num_units,
                      curr.price_per_unit
                    )),
                  0
                )
              : 0) +
            multiplyNullableNumbers(
              newPurchaseOrderItem.num_units,
              newPurchaseOrderItem.price_per_unit
            )
          }
        ></TextField>
      </Box>
    </>
  );
}

export default ListPurchaseOrderItems;
