import {
  Box,
  createStyles,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    wrapper: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      width: "100vw",
      height: "100vh",
      overflow: "scroll",
    },
    container: {
      display: "flex",
      flexDirection: "column",
      width: "100%",
      maxWidth: 500,
      paddingTop: theme.spacing(8),
      paddingBottom: theme.spacing(8),
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
  })
);

function ReviewPurchaseOrderCompletePage() {
  const classes = useStyles();

  return (
    <Box className={classes.wrapper}>
      <Box className={classes.container}>
        <Box display="flex" flexDirection="column">
          <Typography variant="h5">Thank you!</Typography>
          <Box mt={1}>
            <Typography variant="body2">
              Your decision to approve or reject the purchase order was saved
              successfully. If we need any further information from you, we will
              contact you directly. You may now close this page.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default ReviewPurchaseOrderCompletePage;
