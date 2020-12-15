import { Button } from "@material-ui/core";
import RegisterVendorModal from "components/Vendors/Customer/AddVendor/Modal";
import { useState } from "react";

function AddButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <RegisterVendorModal handleClose={() => setOpen(false)}></RegisterVendorModal>
      )}
      <Button onClick={() => setOpen(true)} color="primary" variant="contained">
        Add Vendor
      </Button>
    </>
  );
}

export default AddButton;
