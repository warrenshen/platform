import { Box } from "@material-ui/core";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import MetrcPackageDrawer from "components/Transfers/v2/MetrcPackageDrawer";
import { MetrcTransferPackages } from "generated/graphql";
import { useState } from "react";

interface Props {
  label: string;
  metrcPackageId: MetrcTransferPackages["id"];
  isBankUser: boolean;
}

export default function MetrcPackageDrawerLauncher({
  label,
  metrcPackageId,
  isBankUser,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Box>
      {isOpen && (
        <MetrcPackageDrawer
          metrcPackageId={metrcPackageId}
          isBankUser={isBankUser}
          handleClose={() => setIsOpen(false)}
        />
      )}
      <ClickableDataGridCell onClick={() => setIsOpen(true)} label={label} />
    </Box>
  );
}
