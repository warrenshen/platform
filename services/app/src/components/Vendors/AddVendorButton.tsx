import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import AddVendorModal from "components/Vendors/AddVendorModal";
import { Companies } from "generated/graphql";
import { Action } from "lib/auth/rbac-rules";

interface Props {
  companyId: Companies["id"];
  handleDataChange: () => void;
}

function AddVendorButton({ companyId, handleDataChange }: Props) {
  return (
    <Can perform={Action.AddVendor}>
      <ModalButton
        label={"Add Vendor"}
        modal={({ handleClose }) => (
          <AddVendorModal
            companyId={companyId}
            handleClose={() => {
              handleDataChange();
              handleClose();
            }}
          />
        )}
      />
    </Can>
  );
}

export default AddVendorButton;
