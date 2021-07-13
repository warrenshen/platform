import { Box } from "@material-ui/core";
import VendorPartnershipDrawer from "components/Partnership/VendorPartnershipDrawer";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import { CompanyVendorPartnerships } from "generated/graphql";
import { useState } from "react";

interface Props {
  vendorPartnershipId: CompanyVendorPartnerships["id"];
}

export default function VendorPartnershipDrawerLauncher({
  vendorPartnershipId,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Box>
      {isOpen && (
        <VendorPartnershipDrawer
          vendorPartnershipId={vendorPartnershipId}
          handleClose={() => setIsOpen(false)}
        />
      )}
      <ClickableDataGridCell onClick={() => setIsOpen(true)} label={"OPEN"} />
    </Box>
  );
}
