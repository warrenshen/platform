import { Box } from "@material-ui/core";
import EbbaApplicationDrawer from "components/EbbaApplication/EbbaApplicationDrawer";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import { EbbaApplications } from "generated/graphql";
import { useState } from "react";

interface Props {
  ebbaApplicationId: EbbaApplications["id"];
  label?: string;
}

export default function EbbaApplicationDrawerLauncher({
  ebbaApplicationId,
  label,
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
      <ClickableDataGridCell
        onClick={() => setIsOpen(true)}
        label={label || ebbaApplicationId}
      />
    </Box>
  );
}
