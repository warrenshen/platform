import { Box } from "@material-ui/core";
import useAppBarTitle from "hooks/useAppBarTitle";
import { useTitle } from "react-use";

function LoansPastDuePage() {
  useTitle("Loans Past Due | Bespoke");
  useAppBarTitle("Loans Past Due");

  return <Box>Loans Past Due Page</Box>;
}

export default LoansPastDuePage;
