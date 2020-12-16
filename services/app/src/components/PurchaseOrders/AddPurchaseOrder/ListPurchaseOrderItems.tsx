import {
  Box,
  createStyles,
  IconButton,
  makeStyles,
  TextField,
} from "@material-ui/core";
import Add from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";
import {
  PurchaseOrderLineItemsArrRelInsertInput,
  PurchaseOrderLineItemsInsertInput,
} from "generated/graphql";
import { Maybe } from "graphql/jsutils/Maybe";
import { useState } from "react";

function nullableNumbersHelper(num: Maybe<number>): number {
  return num ? num : 0;
}

function multiplyNullableNumbers(
  num1: Maybe<number>,
  num2: Maybe<number>
): number {
  return nullableNumbersHelper(num1) * nullableNumbersHelper(num2);
}

const useStyles = makeStyles(() =>
  createStyles({
    dialogTitle: {
      marginLeft: "21px",
      marginRight: "21px",
      borderBottom: "1px solid #c7c7c7",
    },
    itemInput: {
      marginRight: "15px",
    },
    itemInputLast: {
      width: 200,
      marginRight: "0",
    },
    itemInputGrandTotal: {
      width: 200,
      marginRight: "48px",
    },
  })
);

interface Props {
  purchaseOrderItems: PurchaseOrderLineItemsArrRelInsertInput;
  handlePurchaseOrderItems: (
    items: PurchaseOrderLineItemsArrRelInsertInput
  ) => void;
}

function ListPurchaseOrderItems({
  purchaseOrderItems,
  handlePurchaseOrderItems,
}: Props) {
  const classes = useStyles();
  const [
    newPurchaseOrderItem,
    setNewPurchaseOrderItem,
  ] = useState<PurchaseOrderLineItemsInsertInput>({});
  return (
    <>
      {purchaseOrderItems.data.map((purchaseOrderItem) => (
        <Box display="flex" m={1} key={purchaseOrderItem.id}>
          <TextField
            label="Item"
            className={classes.itemInput}
            value={purchaseOrderItem.item}
            onChange={({ target: { value } }) => {
              const pois = { ...purchaseOrderItems };
              let poi = pois.data.find((i) => i.id === purchaseOrderItem.id);
              if (poi) {
                poi.item = value;
              }
              handlePurchaseOrderItems(pois);
            }}
          ></TextField>
          <TextField
            label="Description"
            className={classes.itemInput}
            value={purchaseOrderItem.description}
            onChange={({ target: { value } }) => {
              const pois = { ...purchaseOrderItems };
              let poi = pois.data.find((i) => i.id === purchaseOrderItem.id);
              if (poi) {
                poi.description = value;
              }
              handlePurchaseOrderItems(pois);
            }}
          ></TextField>
          <TextField
            label="Units"
            className={classes.itemInput}
            value={purchaseOrderItem.num_units}
            onChange={({ target: { value } }) => {
              const pois = { ...purchaseOrderItems };
              let poi = pois.data.find((i) => i.id === purchaseOrderItem.id);
              if (poi) {
                const u = +value;
                poi.num_units = isNaN(u) ? 0 : u;
              }
              handlePurchaseOrderItems(pois);
            }}
          ></TextField>
          <TextField
            label="Unit"
            className={classes.itemInput}
            value={purchaseOrderItem.unit}
            onChange={({ target: { value } }) => {
              const pois = { ...purchaseOrderItems };
              let poi = pois.data.find((i) => i.id === purchaseOrderItem.id);
              if (poi) {
                poi.unit = value;
              }
              handlePurchaseOrderItems(pois);
            }}
          ></TextField>
          <TextField
            label="Price Per Unit"
            className={classes.itemInput}
            value={purchaseOrderItem.price_per_unit}
            onChange={({ target: { value } }) => {
              const pois = { ...purchaseOrderItems };
              let poi = pois.data.find((i) => i.id === purchaseOrderItem.id);
              if (poi) {
                const u = +value;
                poi.price_per_unit = isNaN(u) ? 0 : u;
              }
              handlePurchaseOrderItems(pois);
            }}
          ></TextField>
          <TextField
            label="Total"
            disabled={true}
            className={classes.itemInput}
            value={multiplyNullableNumbers(
              purchaseOrderItem.num_units,
              purchaseOrderItem.price_per_unit
            )}
          ></TextField>
          <IconButton
            onClick={() => {
              handlePurchaseOrderItems({
                ...purchaseOrderItems,
                data: purchaseOrderItems.data.filter(
                  (i) => i.id !== purchaseOrderItem.id
                ),
              });
            }}
            component="span"
            color="secondary"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
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
            onClick={() => {
              handlePurchaseOrderItems({
                ...purchaseOrderItems,
                data: [...purchaseOrderItems.data, newPurchaseOrderItem],
              });
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
            purchaseOrderItems.data.reduce(
              (acc, curr) =>
                (acc += multiplyNullableNumbers(
                  curr.num_units,
                  curr.price_per_unit
                )),
              0
            ) +
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
