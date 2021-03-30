import { Box } from "@material-ui/core";
import LoanDrawer from "components/Loan/LoanDrawer";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import { Loans } from "generated/graphql";
import { useState } from "react";

interface Props {
  label: string;
  loanId: Loans["id"];
}

function Launcher({ label, loanId }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Box>
      {isOpen && (
        <LoanDrawer loanId={loanId} handleClose={() => setIsOpen(false)} />
      )}
      <ClickableDataGridCell onClick={() => setIsOpen(true)} label={label} />
    </Box>
  );
}

export default Launcher;
