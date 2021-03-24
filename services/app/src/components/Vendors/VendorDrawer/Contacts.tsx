import { Box } from "@material-ui/core";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import InviteThirdPartyUserModal from "components/Users/InviteThirdPartyUserModal";
import ContactCard from "components/Vendors/VendorDrawer/ContactCard";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  Companies,
  CompanyVendorPartnerships,
  ContactFragment,
} from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
import { useContext, useState } from "react";

interface Props {
  companyId: Companies["id"];
  companyVendorPartnershipId: CompanyVendorPartnerships["id"];
  contacts: Array<ContactFragment>;
  handleDataChange: () => void;
}

function Contacts({
  companyId,
  companyVendorPartnershipId,
  contacts,
  handleDataChange,
}: Props) {
  const {
    user: { role },
  } = useContext(CurrentUserContext);
  const [addingContact, setAddingContact] = useState(false);

  return (
    <Box mb={3} mt={1}>
      <Can perform={Action.AddVendorContact}>
        <ModalButton
          label={"New Contact"}
          size="small"
          variant="outlined"
          modal={({ handleClose }) => (
            <InviteThirdPartyUserModal
              isPayor={false}
              companyId={companyId}
              handleClose={() => {
                handleDataChange();
                handleClose();
              }}
            />
          )}
        />
      </Can>
      {addingContact && (
        <ContactCard
          companyId={companyId}
          companyVendorPartnershipId={companyVendorPartnershipId}
          creating
          onCreateComplete={() => setAddingContact(false)}
        />
      )}
      {contacts.map((contact) => {
        return (
          <ContactCard
            key={contact.id}
            contact={contact}
            companyVendorPartnershipId={companyVendorPartnershipId}
            isEditAllowed={check(role, Action.EditVendorContact)}
          />
        );
      })}
    </Box>
  );
}

export default Contacts;
