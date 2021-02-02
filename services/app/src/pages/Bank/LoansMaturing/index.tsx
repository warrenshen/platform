import { Box } from "@material-ui/core";
import useAppBarTitle from "hooks/useAppBarTitle";
import { useTitle } from "react-use";

function LoansMaturingPage() {
  useTitle("Loans Maturing | Bespoke");
  useAppBarTitle("Loans Maturing in X Days");

  return <Box>Loans Maturing in X Days Page</Box>;
}

export default LoansMaturingPage;
