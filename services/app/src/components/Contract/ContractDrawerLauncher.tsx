import ContractDrawer from "components/Contract/ContractDrawer";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import { Contracts } from "generated/graphql";
import { ReactNode, useState } from "react";

interface Props {
  label?: string;
  contractId: Contracts["id"];
  children?: (handleClick: () => void) => ReactNode;
}

export default function ContractDrawerLauncher({
  label,
  contractId,
  children,
}: Props) {
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
          label={label || contractId}
          onClick={() => setIsOpen(true)}
        />
      )}
    </>
  );
}
