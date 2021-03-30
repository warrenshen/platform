import { Box, Button } from "@material-ui/core";
import EbbaApplicationDrawer from "components/EbbaApplication/EbbaApplicationDrawer";
import { EbbaApplications } from "generated/graphql";
import { truncateUuid } from "lib/uuid";
import { useState } from "react";

interface Props {
  ebbaApplicationId: EbbaApplications["id"];
}

function EbbaApplicationDrawerLauncher({ ebbaApplicationId }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Box>
      {isOpen && (
        <EbbaApplicationDrawer
          ebbaApplicationId={ebbaApplicationId}
          handleClose={() => setIsOpen(false)}
        />
      )}
      <Button color="primary" onClick={() => setIsOpen(true)}>
        {truncateUuid(ebbaApplicationId)}
      </Button>
    </Box>
  );
}

export default EbbaApplicationDrawerLauncher;
