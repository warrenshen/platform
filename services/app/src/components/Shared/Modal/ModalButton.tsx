import { Box, Button } from "@material-ui/core";
import { ReactNode, useState } from "react";

interface Props {
  "data-cy"?: string;
  isDisabled?: boolean;
  label: string;
  color?: "inherit" | "primary" | "secondary" | "default" | undefined;
  size?: "small" | "medium" | "large" | undefined;
  variant?: "text" | "outlined" | "contained" | undefined;
  handleClick?: ({ handleOpen }: { handleOpen: () => void }) => void;
  modal: ({ handleClose }: { handleClose: () => void }) => ReactNode;
}

function ModalButton({
  "data-cy": dataCy,
  isDisabled = false,
  label,
  color,
  size,
  variant,
  handleClick,
  modal,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Box>
      {isOpen && modal({ handleClose: () => setIsOpen(false) })}
      <Button
        data-cy={dataCy}
        disabled={isOpen || isDisabled}
        color={color || "primary"}
        size={size || "medium"}
        variant={variant || "contained"}
        onClick={() => {
          if (handleClick) {
            handleClick({ handleOpen: () => setIsOpen(true) });
          } else {
            setIsOpen(true);
          }
        }}
      >
        {label}
      </Button>
    </Box>
  );
}

export default ModalButton;
