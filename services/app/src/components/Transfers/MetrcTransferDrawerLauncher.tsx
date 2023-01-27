import { Box } from "@material-ui/core";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import MetrcTransferDrawer from "components/Transfers/v2/MetrcTransferDrawer";
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
        <MetrcTransferDrawer
          metrcTransferId={metrcTransferId}
          handleClose={() => setIsOpen(false)}
        />
      )}
      <ClickableDataGridCell onClick={() => setIsOpen(true)} label={label} />
    </Box>
  );
}
