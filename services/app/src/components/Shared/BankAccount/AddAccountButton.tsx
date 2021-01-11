import { Button } from "@material-ui/core";
import AccountModal from "components/Shared/BankAccount/AccountModal";
import { Companies } from "generated/graphql";
import { useState } from "react";

interface Props {
  companyId?: Companies["id"];
}

function AddAccountButton(props: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <AccountModal
          companyId={props.companyId}
          handleClose={() => setOpen(false)}
        ></AccountModal>
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
