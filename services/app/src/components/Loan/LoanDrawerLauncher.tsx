import LoanDrawer from "components/Loan/LoanDrawer";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import { Loans } from "generated/graphql";
import React, { useState } from "react";

interface Props {
  label: string;
  loanId: Loans["id"];
}

function Launcher({ label, loanId }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {isOpen && (
        <LoanDrawer loanId={loanId} handleClose={() => setIsOpen(false)} />
      )}
      <ClickableDataGridCell onClick={() => setIsOpen(true)} label={label} />
    </>
  );
}

export default Launcher;
