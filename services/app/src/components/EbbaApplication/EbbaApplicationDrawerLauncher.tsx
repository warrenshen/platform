import { Box } from "@material-ui/core";
import EbbaApplicationDrawer from "components/EbbaApplication/EbbaApplicationDrawer";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import { EbbaApplications } from "generated/graphql";
import { ReactNode, useState } from "react";

interface Props {
  ebbaApplicationId: EbbaApplications["id"];
  label?: string;
  children?: (handleClick: () => void) => ReactNode;
}

export default function EbbaApplicationDrawerLauncher({
  ebbaApplicationId,
  label,
  children,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Box>
      {isOpen && (
        <EbbaApplicationDrawer
          ebbaApplicationId={ebbaApplicationId}
          handleClose={() => setIsOpen(false)}
        />
      )}
      {children ? (
        children(() => setIsOpen(true))
      ) : (
        <ClickableDataGridCell
          label={label || ebbaApplicationId}
          onClick={() => setIsOpen(true)}
        />
      )}
    </Box>
  );
}
