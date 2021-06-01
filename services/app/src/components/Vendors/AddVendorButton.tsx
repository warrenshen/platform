import ModalButton from "components/Shared/Modal/ModalButton";
import AddVendorModal from "components/Vendors/AddVendorModal";
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
      label={"Add Vendor"}
      modal={({ handleClose }) => (
        <AddVendorModal
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
