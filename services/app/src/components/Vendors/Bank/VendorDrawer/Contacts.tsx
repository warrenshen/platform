import { Box, Button } from "@material-ui/core";
import ContactCard from "components/ContactCard";
import {
  Companies,
  CompanyVendorPartnerships,
  ContactFragment,
} from "generated/graphql";
import { useState } from "react";

interface Props {
  companyId: Companies["id"];
  companyVendorPartnershipId: CompanyVendorPartnerships["id"];
  contacts: Array<ContactFragment>;
}

function Contacts(props: Props) {
  const [addingContact, setAddingContact] = useState(false);

  return (
    <Box mb={3} mt={1}>
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
      {addingContact && (
        <ContactCard
          companyId={props.companyId}
          companyVendorPartnershipId={props.companyVendorPartnershipId}
          creating
          onCreateComplete={() => setAddingContact(false)}
        ></ContactCard>
      )}
      {props.contacts.map((contact) => {
        return (
          <ContactCard
            contact={contact}
            companyVendorPartnershipId={props.companyVendorPartnershipId}
          ></ContactCard>
        );
      })}
    </Box>
  );
}

export default Contacts;
