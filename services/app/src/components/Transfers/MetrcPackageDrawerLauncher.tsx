import { Box } from "@material-ui/core";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import MetrcPackageModal from "components/Transfers/MetrcPackageModal";
import { MetrcTransferPackages } from "generated/graphql";
import { useState } from "react";

interface Props {
  label: string;
  metrcPackageId: MetrcTransferPackages["id"];
}

export default function MetrcTransferDrawerLauncher({
  label,
  metrcPackageId,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Box>
      {isOpen && (
        <MetrcPackageModal
          metrcPackageId={metrcPackageId}
          handleClose={() => setIsOpen(false)}
        />
      )}
      <ClickableDataGridCell onClick={() => setIsOpen(true)} label={label} />
    </Box>
  );
}
