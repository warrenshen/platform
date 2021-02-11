import { Box, createStyles, makeStyles, Theme } from "@material-ui/core";
import Layout from "components/Shared/Layout";
import React from "react";

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

interface Props {
  appBarTitle: string;
  children: React.ReactNode;
}

function Page({ appBarTitle, children }: Props) {
  const classes = useStyles();

  return (
    <Layout appBarTitle={appBarTitle}>
      <Box className={classes.container}>{children}</Box>
    </Layout>
  );
}

export default Page;
