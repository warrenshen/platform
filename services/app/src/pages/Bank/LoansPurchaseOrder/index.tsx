import { Box } from "@material-ui/core";
import useAppBarTitle from "hooks/useAppBarTitle";
import { useTitle } from "react-use";

function LoansPurchaseOrderPage() {
  useTitle("Loans Purchase Order | Bespoke");
  useAppBarTitle("Loans Purchase Order");

  return <Box>Loans Purchase Order Page</Box>;
}

export default LoansPurchaseOrderPage;
