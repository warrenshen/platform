import AddPayorModal from "components/Payors/AddPayorModal";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import { Companies } from "generated/graphql";
import { Action } from "lib/auth/rbac-rules";

interface Props {
  customerId: Companies["id"];
  handleDataChange: () => void;
}

function AddPayorButton({ customerId, handleDataChange }: Props) {
  return (
    <Can perform={Action.AddPayor}>
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
    </Can>
  );
}

export default AddPayorButton;
