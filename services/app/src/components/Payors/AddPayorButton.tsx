import AddPayorModal from "components/Payors/AddPayorModal";
import ModalButton from "components/Shared/Modal/ModalButton";
import { Companies } from "generated/graphql";

interface Props {
  customerId: Companies["id"];
  isActiveContract: boolean;
  handleDataChange: () => void;
}

export default function AddPayorButton({
  customerId,
  isActiveContract,
  handleDataChange,
}: Props) {
  return (
    <ModalButton
      label={"Add Payor"}
      isDisabled={!isActiveContract}
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
