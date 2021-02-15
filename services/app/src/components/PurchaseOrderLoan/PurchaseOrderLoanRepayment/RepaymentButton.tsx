import { Button } from "@material-ui/core";
import RepaymentModal from "components/Shared/Payments/Repayment/RepaymentModal";
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
        <RepaymentModal
          companyId={companyId}
          handleClose={() => setOpen(false)}
          selectedLoans={selectedLoans}
          setOpen={setOpen}
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
