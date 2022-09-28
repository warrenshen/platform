import ModalButton from "components/Shared/Modal/ModalButton";
import AddVendorNewModal from "components/Vendors/AddVendorNewModal";
import { Companies } from "generated/graphql";

interface Props {
  customerId: Companies["id"];
  isDisabled?: boolean;
  handleDataChange: () => void;
}

export default function AddVendorButton({
  customerId,
  isDisabled,
  handleDataChange,
}: Props) {
  return (
    <ModalButton
      dataCy={"invite-vendor-button"}
      label={"Invite Vendor"}
      isDisabled={isDisabled}
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
