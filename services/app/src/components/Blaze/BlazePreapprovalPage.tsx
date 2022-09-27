import { Box, Theme, createStyles, makeStyles } from "@material-ui/core";
import BlazeComingSoonCard from "components/Blaze/BlazeComingSoonCard";
import BlazePreapprovalCard from "components/Blaze/BlazePreapprovalCard";
import { BlazePreapprovalFragment } from "generated/graphql";
import { todayAsDateStringServer } from "lib/date";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    wrapper: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      width: "100vw",
      height: "100vh",
      overflow: "scroll",
      backgroundColor: "rgb(246, 245, 243)",
    },
    container: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      width: "100%",
      maxWidth: 500,
      height: "100%",
      paddingTop: theme.spacing(8),
      paddingBottom: theme.spacing(8),
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
  })
);

interface Props {
  isAuthenticateBlazeUserLoading: boolean;
  blazePreapproval: BlazePreapprovalFragment | null;
}

export default function BlazePreapprovalPage({
  isAuthenticateBlazeUserLoading,
  blazePreapproval,
}: Props) {
  const classes = useStyles();
  const today = todayAsDateStringServer();

  return (
    <Box className={classes.wrapper}>
      <Box className={classes.container}>
        {isAuthenticateBlazeUserLoading ? (
          <div>Loading...</div>
        ) : today > "2022-12-31" ? (
          <BlazePreapprovalCard blazePreapproval={blazePreapproval} />
        ) : (
          <BlazeComingSoonCard />
        )}
      </Box>
    </Box>
  );
}
