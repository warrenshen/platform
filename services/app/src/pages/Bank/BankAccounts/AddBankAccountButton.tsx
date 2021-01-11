import { Button } from "@material-ui/core";
import BankAccountModal from "pages/Bank/BankAccounts/BankAccountModal";
import { useState } from "react";

function AddBankAccountButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <BankAccountModal handleClose={() => setOpen(false)}></BankAccountModal>
      )}
      <Button
        disabled={open}
        onClick={() => {
          setOpen(true);
        }}
        color="primary"
        variant="contained"
      >
        Add Bank Account
      </Button>
    </>
  );
}

export default AddBankAccountButton;
