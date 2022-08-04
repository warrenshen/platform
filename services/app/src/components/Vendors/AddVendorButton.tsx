import ModalButton from "components/Shared/Modal/ModalButton";
import AddVendorNewModal from "components/Vendors/AddVendorNewModal";
import { Companies } from "generated/graphql";

interface Props {
  customerId: Companies["id"];
  handleDataChange: () => void;
}

export default function AddVendorButton({
  customerId,
  handleDataChange,
}: Props) {
  return (
    <ModalButton
      dataCy={"invite-vendor-button"}
      label={"Invite Vendor"}
      modal={({ handleClose }) => (
        <AddVendorNewModal
          customerId={customerId}
          handleClose={() => {
            handleDataChange();
            handleClose();
          }}
        />
      )}
    />
  );
}
