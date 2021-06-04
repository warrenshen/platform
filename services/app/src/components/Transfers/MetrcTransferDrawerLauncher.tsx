import { Box } from "@material-ui/core";
import MetrcTransferModal from "components/Transfers/MetrcTransferModal";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import { MetrcTransfers } from "generated/graphql";
import { useState } from "react";

interface Props {
  label: string;
  metrcTransferId: MetrcTransfers["id"];
}

export default function MetrcTransferDrawerLauncher({
  label,
  metrcTransferId,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Box>
      {isOpen && (
        <MetrcTransferModal
          metrcTransferId={metrcTransferId}
          handleClose={() => setIsOpen(false)}
        />
      )}
      <ClickableDataGridCell onClick={() => setIsOpen(true)} label={label} />
    </Box>
  );
}
