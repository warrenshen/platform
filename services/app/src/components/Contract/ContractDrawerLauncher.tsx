import ContractDrawer from "components/Contract/ContractDrawer";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import { Contracts } from "generated/graphql";
import { truncateUuid } from "lib/uuid";
import { ReactNode, useState } from "react";

interface Props {
  label?: string;
  contractId: Contracts["id"];
  children?: (handleClick: () => void) => ReactNode;
}

function Launcher({ label, contractId, children }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {isOpen && (
        <ContractDrawer
          contractId={contractId}
          handleClose={() => setIsOpen(false)}
        />
      )}
      {children ? (
        children(() => setIsOpen(true))
      ) : (
        <ClickableDataGridCell
          label={label || truncateUuid(contractId)}
          onClick={() => setIsOpen(true)}
        />
      )}
    </>
  );
}

export default Launcher;
