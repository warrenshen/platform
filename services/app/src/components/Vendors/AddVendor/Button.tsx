import { Button } from "@material-ui/core";
import RegisterVendorModal from "components/Vendors/AddVendor/RegisterVendorModal";
import { useState } from "react";

function AddButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && <RegisterVendorModal handleClose={() => setOpen(false)} />}
      <Button onClick={() => setOpen(true)} color="primary" variant="contained">
        Add Vendor
      </Button>
    </>
  );
}

export default AddButton;
