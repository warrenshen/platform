import { Button } from "@material-ui/core";
import AddModal from "components/Bank/AddCustomer/AddModal";
import { useState } from "react";

function AddButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && <AddModal onClose={() => setOpen(false)}></AddModal>}
      <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
        Add Customer
      </Button>
    </>
  );
}

export default AddButton;
