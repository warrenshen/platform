import { Button } from "@material-ui/core";
import CreateUpdateBankAccountModal from "components/BankAccount/CreateUpdateBankAccountModal";
import { Companies } from "generated/graphql";
import { useState } from "react";

interface Props {
  companyId: Companies["id"] | null;
}

function AddAccountButton(props: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <CreateUpdateBankAccountModal
          companyId={props.companyId}
          existingBankAccount={null}
          handleClose={() => setOpen(false)}
        />
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

export default AddAccountButton;
