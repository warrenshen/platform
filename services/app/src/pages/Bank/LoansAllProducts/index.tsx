import { Box } from "@material-ui/core";
import useAppBarTitle from "hooks/useAppBarTitle";
import { useTitle } from "react-use";

function LoansAllProductsPage() {
  useTitle("Loans All Products | Bespoke");
  useAppBarTitle("Loans All Products");

  return <Box>Loans All Products Page</Box>;
}

export default LoansAllProductsPage;
