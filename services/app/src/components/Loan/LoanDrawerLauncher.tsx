import { Box } from "@material-ui/core";
import BankLoanDrawer from "components/Loan/v2/BankLoanDrawer";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import {
  CurrentUserContext,
  isRoleBankUser,
} from "contexts/CurrentUserContext";
import { Loans } from "generated/graphql";
import { useContext, useState } from "react";

interface Props {
  label: string;
  loanId: Loans["id"];
}

function Launcher({ label, loanId }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    user: { role },
  } = useContext(CurrentUserContext);
  const isBankUser = isRoleBankUser(role);

  return (
    <Box>
      {isOpen && (
        <BankLoanDrawer
          loanId={loanId}
          isBankUser={isBankUser}
          handleClose={() => setIsOpen(false)}
        />
      )}
      <ClickableDataGridCell onClick={() => setIsOpen(true)} label={label} />
    </Box>
  );
}

export default Launcher;
