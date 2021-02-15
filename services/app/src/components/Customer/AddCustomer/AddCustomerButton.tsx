import { Button } from "@material-ui/core";
import AddCustomerModal from "components/Customer/AddCustomer/AddCustomerModal";
import { useState } from "react";

function AddCustomerButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <AddCustomerModal handleClose={() => setOpen(false)}></AddCustomerModal>
      )}
      <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
        Add Customer
      </Button>
    </>
  );
}

export default AddCustomerButton;
