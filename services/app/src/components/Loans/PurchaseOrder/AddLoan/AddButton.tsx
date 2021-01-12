import { Button } from "@material-ui/core";
import { useState } from "react";
import AddLoanModal from "./AddLoanModal";

function AddButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && <AddLoanModal handleClose={() => setOpen(false)}></AddLoanModal>}
      <Button
        onClick={() => {
          setOpen(true);
        }}
        variant="contained"
        color="primary"
      >
        Add Loan
      </Button>
    </>
  );
}

export default AddButton;
