import { Box, Button } from "@material-ui/core";
import Can from "components/Shared/Can";
import ContactCard from "components/ThirdParties/ContactCard";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { Companies, ContactFragment } from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
import { useContext, useState } from "react";

interface Props {
  companyId: Companies["id"];
  contacts: Array<ContactFragment>;
  onActionComplete: () => Promise<null>;
}

export default function Contacts({
  companyId,
  contacts,
  onActionComplete,
}: Props) {
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
              onActionComplete();
              setAddingContact(true);
            }}
          >
            New
          </Button>
        </Box>
      </Can>
      {addingContact && (
        <ContactCard
          isCreating
          companyId={companyId}
          onCreateComplete={async () => {
            onActionComplete();
            setAddingContact(false);
          }}
        />
      )}
      {contacts.map((contact) => {
        return (
          <ContactCard
            key={contact.id}
            isEditAllowed={check(role, Action.EditVendorContact)}
            contact={contact}
          />
        );
      })}
    </Box>
  );
}
