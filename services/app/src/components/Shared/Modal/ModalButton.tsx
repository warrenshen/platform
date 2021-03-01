import { Box, Button } from "@material-ui/core";
import { ReactNode, useState } from "react";

interface Props {
  isDisabled?: boolean;
  label: string;
  size?: "small" | "medium" | "large" | undefined;
  variant?: "text" | "outlined" | "contained" | undefined;
  modal: ({ handleClose }: { handleClose: () => void }) => ReactNode;
}

function ModalButton({
  isDisabled = false,
  label,
  size,
  variant,
  modal,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Box>
      {isOpen && modal({ handleClose: () => setIsOpen(false) })}
      <Button
        disabled={isOpen || isDisabled}
        color="primary"
        size={size || "medium"}
        variant={variant || "contained"}
        onClick={() => setIsOpen(true)}
      >
        {label}
      </Button>
    </Box>
  );
}

export default ModalButton;
