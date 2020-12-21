import {
  Box,
  createStyles,
  IconButton,
  makeStyles,
  TextField,
} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import { PurchaseOrderLineItemFragment } from "generated/graphql";
import { ItemAction } from "../models/ItemAction";
import { multiplyNullableNumbers } from "../models/NumberHelper";

const useStyles = makeStyles(() =>
  createStyles({
    itemInput: {
      marginRight: "15px",
    },
    itemInputLast: {
      minWidth: 200,
      marginRight: "0",
    },
  })
);

interface Props {
  position: number;
  purchaseOrderItem: PurchaseOrderLineItemFragment;
  handlePurchaseOrderItem: (
    items: PurchaseOrderLineItemFragment,
    action: ItemAction,
    position: number
  ) => void;
}

function PurchaseOrderLineItems({
  position,
  purchaseOrderItem,
  handlePurchaseOrderItem,
}: Props) {
  const classes = useStyles();
  return (
    <>
      <Box display="flex" m={1}>
        <TextField
          label="Item"
          className={classes.itemInput}
          value={purchaseOrderItem.item}
          onChange={({ target: { value } }) => {
            handlePurchaseOrderItem(
              { ...purchaseOrderItem, item: value },
              ItemAction.Change,
              position
            );
          }}
        ></TextField>
        <TextField
          label="Description"
          className={classes.itemInput}
          value={purchaseOrderItem.description}
          onChange={({ target: { value } }) => {
            handlePurchaseOrderItem(
              {
                ...purchaseOrderItem,
                description: value,
              },
              ItemAction.Change,
              position
            );
          }}
        ></TextField>
        <TextField
          label="Units"
          className={classes.itemInput}
          value={purchaseOrderItem.num_units}
          onChange={({ target: { value } }) => {
            const u = +value;
            handlePurchaseOrderItem(
              {
                ...purchaseOrderItem,
                num_units: isNaN(u) ? 0 : u,
              },
              ItemAction.Change,
              position
            );
          }}
        ></TextField>
        <TextField
          label="Unit"
          className={classes.itemInput}
          value={purchaseOrderItem.unit}
          onChange={({ target: { value } }) => {
            handlePurchaseOrderItem(
              { ...purchaseOrderItem, unit: value },
              ItemAction.Change,
              position
            );
          }}
        ></TextField>
        <TextField
          label="Price Per Unit"
          className={classes.itemInput}
          value={purchaseOrderItem.price_per_unit}
          onChange={({ target: { value } }) => {
            const u = +value;
            handlePurchaseOrderItem(
              {
                ...purchaseOrderItem,
                price_per_unit: isNaN(u) ? 0 : u,
              },
              ItemAction.Change,
              position
            );
          }}
        ></TextField>
        <TextField
          label="Total"
          disabled={true}
          className={classes.itemInputLast}
          value={multiplyNullableNumbers(
            purchaseOrderItem.num_units,
            purchaseOrderItem.price_per_unit
          )}
        ></TextField>
        <IconButton
          onClick={() => {
            handlePurchaseOrderItem(
              purchaseOrderItem,
              ItemAction.Remove,
              position
            );
          }}
          component="span"
          color="secondary"
        >
          <DeleteIcon />
        </IconButton>
      </Box>
    </>
  );
}

export default PurchaseOrderLineItems;
