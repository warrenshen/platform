import { Box } from "@material-ui/core";
import PayorPartnershipDrawer from "components/Partnership/PayorPartnershipDrawer";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import { CompanyPayorPartnerships } from "generated/graphql";
import { useState } from "react";

interface Props {
  payorPartnershipId: CompanyPayorPartnerships["id"];
}

export default function PayorPartnershipDrawerLauncher({
  payorPartnershipId,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Box>
      {isOpen && (
        <PayorPartnershipDrawer
          payorPartnershipId={payorPartnershipId}
          handleClose={() => setIsOpen(false)}
        />
      )}
      <ClickableDataGridCell onClick={() => setIsOpen(true)} label={"OPEN"} />
    </Box>
  );
}
