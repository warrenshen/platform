import { Button } from "@material-ui/core";
import AddVendorModal from "components/Partners/AddVendor/Modal";
import { useState } from "react";

function AddButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <AddVendorModal handleClose={() => setOpen(false)}></AddVendorModal>
      )}
      <Button onClick={() => setOpen(true)} color="primary">
        Add Vendor
      </Button>
    </>
  );
}

export default AddButton;
