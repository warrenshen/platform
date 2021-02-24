import ContractDrawer from "components/Contract/ContractDrawer";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import { Contracts } from "generated/graphql";
import { truncateUuid } from "lib/uuid";
import React, { useState } from "react";

interface Props {
  contractId: Contracts["id"];
}

function Launcher({ contractId }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {isOpen && (
        <ContractDrawer
          contractId={contractId}
          handleClose={() => setIsOpen(false)}
        />
      )}
      <ClickableDataGridCell
        onClick={() => setIsOpen(true)}
        label={truncateUuid(contractId)}
      />
    </>
  );
}

export default Launcher;
