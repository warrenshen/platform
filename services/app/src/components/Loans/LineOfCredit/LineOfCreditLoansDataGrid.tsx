import { Box } from "@material-ui/core";
import { LoanFragment } from "generated/graphql";

interface Props {
  loans: LoanFragment[];
}

function LineOfCreditLoansDataGrid({ loans }: Props) {
  return (
    <Box flex={1} display="flex">
      Line of Credit Loans Data Grid
    </Box>
  );
}

export default LineOfCreditLoansDataGrid;
