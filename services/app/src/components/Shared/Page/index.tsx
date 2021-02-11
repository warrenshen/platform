import { Box, createStyles, makeStyles, Theme } from "@material-ui/core";
import Layout from "components/Shared/Layout";
import React, { FunctionComponent } from "react";

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

const Page: FunctionComponent = ({ children }) => {
  const classes = useStyles();

  return (
    <Layout>
      <Box className={classes.container}>{children}</Box>
    </Layout>
  );
};

export default Page;
