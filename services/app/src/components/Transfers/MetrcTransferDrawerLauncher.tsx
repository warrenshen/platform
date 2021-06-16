import { Box } from "@material-ui/core";
import MetrcTransferModal from "components/Transfers/MetrcTransferModal";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import { Companies, MetrcTransfers } from "generated/graphql";
import { useState } from "react";

interface Props {
  label: string;
  companyId: Companies["id"];
  metrcTransferId: MetrcTransfers["id"];
}

export default function MetrcTransferDrawerLauncher({
  label,
  companyId,
  metrcTransferId,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Box>
      {isOpen && (
        <MetrcTransferModal
          companyId={companyId}
          metrcTransferId={metrcTransferId}
          handleClose={() => setIsOpen(false)}
        />
      )}
      <ClickableDataGridCell onClick={() => setIsOpen(true)} label={label} />
    </Box>
  );
}
