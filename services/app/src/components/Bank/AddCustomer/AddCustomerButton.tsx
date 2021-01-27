import { Button } from "@material-ui/core";
import AddModal from "components/Bank/AddCustomer/AddCustomerModal";
import { useState } from "react";

function AddCustomerButton() {
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

export default AddCustomerButton;
