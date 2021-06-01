import AddPayorModal from "components/Payors/AddPayorModal";
import ModalButton from "components/Shared/Modal/ModalButton";
import { Companies } from "generated/graphql";

interface Props {
  customerId: Companies["id"];
  handleDataChange: () => void;
}

export default function AddPayorButton({
  customerId,
  handleDataChange,
}: Props) {
  return (
    <ModalButton
      label={"Add Payor"}
      modal={({ handleClose }) => (
        <AddPayorModal
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
