import { Button } from "@material-ui/core";
import EbbaApplicationDrawer from "components/EbbaApplication/EbbaApplicationDrawer";
import { EbbaApplications } from "generated/graphql";
import React, { useState } from "react";

interface Props {
  label: string;
  ebbaApplicationId: EbbaApplications["id"];
}

function Launcher({ label, ebbaApplicationId }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {isOpen && (
        <EbbaApplicationDrawer
          ebbaApplicationId={ebbaApplicationId}
          handleClose={() => setIsOpen(false)}
        />
      )}
      <Button color="primary" onClick={() => setIsOpen(true)}>
        {label}
      </Button>
    </>
  );
}

export default Launcher;
