import { Box } from "@material-ui/core";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import ContactCard from "components/ThirdParties/ContactCard";
import CreateUpdateThirdPartyUserModal from "components/Users/CreateUpdateThirdPartyUserModal";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { Companies, ContactFragment } from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
import { ActionType } from "lib/enum";
import { useContext } from "react";

interface Props {
  isPayor: boolean;
  companyId: Companies["id"];
  contacts: Array<ContactFragment>;
  handleDataChange: () => void;
}

function Contacts({ isPayor, companyId, contacts, handleDataChange }: Props) {
  const {
    user: { role },
  } = useContext(CurrentUserContext);

  return (
    <Box mb={3} mt={1}>
      <Can perform={Action.AddVendorContact}>
        <Box mb={2}>
          <ModalButton
            label={"New Contact"}
            size="small"
            variant="outlined"
            modal={({ handleClose }) => (
              <CreateUpdateThirdPartyUserModal
                actionType={ActionType.New}
                isPayor={isPayor}
                companyId={companyId}
                userId={null}
                handleClose={() => {
                  handleDataChange();
                  handleClose();
                }}
              />
            )}
          />
        </Box>
      </Can>
      {contacts.map((contact) => (
        <ContactCard
          key={contact.id}
          isEditAllowed={check(role, Action.EditVendorContact)}
          isPayor={isPayor}
          companyId={companyId}
          contact={contact}
          handleDataChange={handleDataChange}
        />
      ))}
    </Box>
  );
}

export default Contacts;
