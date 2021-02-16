import { Button } from "@material-ui/core";
import CreateRepaymentModal from "components/Repayment/CreateRepaymentModal";
import { LoanFragment } from "generated/graphql";
import useCompanyContext from "hooks/useCompanyContext";
import { useState } from "react";

interface Props {
  selectedLoans: LoanFragment[];
}

function RepaymentButton({ selectedLoans }: Props) {
  const companyId = useCompanyContext();
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <CreateRepaymentModal
          companyId={companyId}
          selectedLoans={selectedLoans}
          handleClose={() => setOpen(false)}
        />
      )}
      <Button
        disabled={selectedLoans.length <= 0}
        variant="contained"
        color="primary"
        onClick={() => setOpen(true)}
      >
        Make a Payment
      </Button>
    </>
  );
}

export default RepaymentButton;
