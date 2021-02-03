import { Box, createStyles, makeStyles, Theme } from "@material-ui/core";
import Loans from "components/PurchaseOrderLoans";
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

function LoansPage() {
  useTitle("Loans | Bespoke");
  useAppBarTitle("Loans");

  const classes = useStyles();

  return (
    <Box className={classes.container}>
      <Loans></Loans>
    </Box>
  );
}

export default LoansPage;
