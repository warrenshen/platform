import { Box, createStyles, makeStyles, Theme } from "@material-ui/core";
import PurchaseOrders from "components/Shared/PurchaseOrders";
import useAppBarTitle from "hooks/useAppBarTitle";
import React from "react";
import { useTitle } from "react-use";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      padding: theme.spacing(3),
      overflow: "scroll",
    },
  })
);

function PurchaseOrdersPage() {
  useTitle("Purchase Orders | Bespoke");
  useAppBarTitle("Purchase Orders");

  const classes = useStyles();

  return (
    <Box className={classes.container}>
      <PurchaseOrders></PurchaseOrders>
    </Box>
  );
}

export default PurchaseOrdersPage;
