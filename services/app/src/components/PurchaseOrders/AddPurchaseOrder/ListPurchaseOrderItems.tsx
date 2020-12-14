import {
  Box,
  createStyles,
  IconButton,
  makeStyles,
  TextField,
} from "@material-ui/core";
import Add from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";
import { useState } from "react";
import { PurchaseOrderItem } from "../models/PurchaseOrderItem";

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
  purchaseOrderItems: PurchaseOrderItem[];
  handlePurchaseOrderItems: (items: PurchaseOrderItem[]) => void;
}

function ListPurchaseOrderItems({
  purchaseOrderItems,
  handlePurchaseOrderItems,
}: Props) {
  const classes = useStyles();
  const [
    newPurchaseOrderItem,
    setNewPurchaseOrderItem,
  ] = useState<PurchaseOrderItem>({
    id: 0,
    item: "",
    descritpion: "",
    units: 0,
    unit: "",
    pricePerUnit: 0,
  });
  return (
    <>
      {purchaseOrderItems.map((purchaseOrderItem) => (
        <Box display="flex" m={1} key={purchaseOrderItem.id}>
          <TextField
            label="Item"
            className={classes.itemInput}
            value={purchaseOrderItem.item}
            onChange={({ target: { value } }) => {
              const pois = [...purchaseOrderItems];
              let poi = pois.find((i) => i.id === purchaseOrderItem.id);
              if (poi) {
                poi.item = value;
              }
              handlePurchaseOrderItems(pois);
            }}
          ></TextField>
          <TextField
            label="Description"
            className={classes.itemInput}
            value={purchaseOrderItem.descritpion}
            onChange={({ target: { value } }) => {
              const pois = [...purchaseOrderItems];
              let poi = pois.find((i) => i.id === purchaseOrderItem.id);
              if (poi) {
                poi.descritpion = value;
              }
              handlePurchaseOrderItems(pois);
            }}
          ></TextField>
          <TextField
            label="Units"
            className={classes.itemInput}
            value={purchaseOrderItem.units}
            onChange={({ target: { value } }) => {
              const pois = [...purchaseOrderItems];
              let poi = pois.find((i) => i.id === purchaseOrderItem.id);
              if (poi) {
                const u = +value;
                poi.units = isNaN(u) ? 0 : u;
              }
              handlePurchaseOrderItems(pois);
            }}
          ></TextField>
          <TextField
            label="Unit"
            className={classes.itemInput}
            value={purchaseOrderItem.unit}
            onChange={({ target: { value } }) => {
              const pois = [...purchaseOrderItems];
              let poi = pois.find((i) => i.id === purchaseOrderItem.id);
              if (poi) {
                poi.unit = value;
              }
              handlePurchaseOrderItems(pois);
            }}
          ></TextField>
          <TextField
            label="Price Per Unit"
            className={classes.itemInput}
            value={purchaseOrderItem.pricePerUnit}
            onChange={({ target: { value } }) => {
              const pois = [...purchaseOrderItems];
              let poi = pois.find((i) => i.id === purchaseOrderItem.id);
              if (poi) {
                const u = +value;
                poi.pricePerUnit = isNaN(u) ? 0 : u;
              }
              handlePurchaseOrderItems(pois);
            }}
          ></TextField>
          <TextField
            label="Total"
            disabled={true}
            className={classes.itemInput}
            value={purchaseOrderItem.units * purchaseOrderItem.pricePerUnit}
          ></TextField>
          <IconButton
            onClick={() => {
              handlePurchaseOrderItems([
                ...purchaseOrderItems.filter(
                  (i) => i.id !== purchaseOrderItem.id
                ),
              ]);
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
          value={newPurchaseOrderItem.descritpion}
          onChange={({ target: { value } }) => {
            setNewPurchaseOrderItem({
              ...newPurchaseOrderItem,
              descritpion: value,
            });
          }}
        ></TextField>
        <TextField
          label="Units"
          className={classes.itemInput}
          value={newPurchaseOrderItem.units}
          onChange={({ target: { value } }) => {
            const u = +value;
            setNewPurchaseOrderItem({
              ...newPurchaseOrderItem,
              units: isNaN(u) ? 0 : u,
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
          value={newPurchaseOrderItem.pricePerUnit}
          onChange={({ target: { value } }) => {
            const ppU = +value;
            setNewPurchaseOrderItem({
              ...newPurchaseOrderItem,
              pricePerUnit: isNaN(ppU) ? 0 : ppU,
            });
          }}
        ></TextField>
        <TextField
          label="Total"
          disabled={true}
          className={classes.itemInputLast}
          value={newPurchaseOrderItem.units * newPurchaseOrderItem.pricePerUnit}
        ></TextField>
        <Box>
          <IconButton
            onClick={() => {
              handlePurchaseOrderItems([
                ...purchaseOrderItems,
                { ...newPurchaseOrderItem, id: purchaseOrderItems.length },
              ]);
              setNewPurchaseOrderItem({
                id: 0,
                item: "",
                descritpion: "",
                units: 0,
                unit: "",
                pricePerUnit: 0,
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
            purchaseOrderItems.reduce(
              (acc, curr) => (acc += curr.units * curr.pricePerUnit),
              0
            ) +
            newPurchaseOrderItem.units * newPurchaseOrderItem.pricePerUnit
          }
        ></TextField>
      </Box>
    </>
  );
}

export default ListPurchaseOrderItems;
