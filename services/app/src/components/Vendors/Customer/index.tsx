import { Box, createStyles, makeStyles, Theme } from "@material-ui/core";
import AddButton from "components/Vendors/AddVendor/Button";
import ListVendors from "components/Vendors/Customer/ListVendors";

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

function Vendors() {
  const classes = useStyles();

  return (
    <Box className={classes.container}>
      <Box display="flex" flexDirection="row-reverse">
        <AddButton></AddButton>
      </Box>
      <ListVendors></ListVendors>
    </Box>
  );
}

export default Vendors;
