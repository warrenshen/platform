import { Button } from "@material-ui/core";
import RegisterVendorModal from "components/Vendors/AddVendor/RegisterVendorModal";
import Can from "components/Shared/Can";
import { Action } from "lib/auth/rbac-rules";
import { useState } from "react";

function AddButton() {
  const [open, setOpen] = useState(false);

  return (
    <Can perform={Action.AddVendor}>
      {open && <RegisterVendorModal handleClose={() => setOpen(false)} />}
      <Button onClick={() => setOpen(true)} color="primary" variant="contained">
        Add Vendor
      </Button>
    </Can>
  );
}

export default AddButton;
