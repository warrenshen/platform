import { Box } from "@material-ui/core";
import useAppBarTitle from "hooks/useAppBarTitle";
import { useTitle } from "react-use";

function LoansLineOfCreditPage() {
  useTitle("Loans Line of Credit | Bespoke");
  useAppBarTitle("Loans Line of Credit");

  return <Box>Loans Line of Credit Page</Box>;
}

export default LoansLineOfCreditPage;
