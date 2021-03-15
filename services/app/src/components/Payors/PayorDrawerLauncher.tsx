import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import { CompanyPayorPartnerships } from "generated/graphql";
import React, { useState } from "react";
import PayorDrawer from "./PayorDrawer";

interface Props {
  label: string;
  partnershipId: CompanyPayorPartnerships["id"];
}

export default function PayorDrawerLauncher({ label, partnershipId }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {isOpen && (
        <PayorDrawer
          partnershipId={partnershipId}
          handleClose={() => setIsOpen(false)}
        />
      )}
      <ClickableDataGridCell onClick={() => setIsOpen(true)} label={label} />
    </>
  );
}
