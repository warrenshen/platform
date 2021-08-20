import { Box } from "@material-ui/core";
import MetrcPackageModal from "components/Packages/MetrcPackageModal";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import { MetrcPackages } from "generated/graphql";
import { useState } from "react";

interface Props {
  label: string;
  metrcPackageId: MetrcPackages["id"];
}

export default function MetrcPackageDrawerLauncher({
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
