import { Box, Button } from "@material-ui/core";
import Can from "components/Shared/Can";
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
}

function Contacts(props: Props) {
  const {
    user: { role },
  } = useContext(CurrentUserContext);
  const [addingContact, setAddingContact] = useState(false);

  return (
    <Box mb={3} mt={1}>
      <Can perform={Action.AddVendorContact}>
        <Box mb={2}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              setAddingContact(true);
            }}
          >
            New
          </Button>
        </Box>
      </Can>
      {addingContact && (
        <ContactCard
          companyId={props.companyId}
          companyVendorPartnershipId={props.companyVendorPartnershipId}
          creating
          onCreateComplete={() => setAddingContact(false)}
        />
      )}
      {props.contacts.map((contact) => {
        return (
          <ContactCard
            key={contact.id}
            contact={contact}
            companyVendorPartnershipId={props.companyVendorPartnershipId}
            isEditAllowed={check(role, Action.EditVendorContact)}
          />
        );
      })}
    </Box>
  );
}

export default Contacts;
