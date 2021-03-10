import InvoiceDrawer from "components/Invoices/InvoiceDrawer";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import { Invoices } from "generated/graphql";
import React, { useState } from "react";

interface Props {
  label: string;
  invoiceId: Invoices["id"];
}

function Launcher({ label, invoiceId }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {isOpen && (
        <InvoiceDrawer
          invoiceId={invoiceId}
          handleClose={() => setIsOpen(false)}
        />
      )}
      <ClickableDataGridCell onClick={() => setIsOpen(true)} label={label} />
    </>
  );
}

export default Launcher;
