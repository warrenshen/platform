import { Box, Button } from "@material-ui/core";
import { ReactNode, useState } from "react";

interface Props {
  dataCy?: string;
  isDisabled?: boolean;
  label: string | ReactNode;
  color?: "inherit" | "primary" | "secondary" | "default" | undefined;
  size?: "small" | "medium" | "large" | undefined;
  textAlign?: "left" | "center" | "right";
  variant?: "text" | "outlined" | "contained" | undefined;
  handleClick?: ({ handleOpen }: { handleOpen: () => void }) => void;
  modal: ({ handleClose }: { handleClose: () => void }) => ReactNode;
}

export default function ModalButton({
  dataCy,
  isDisabled = false,
  label,
  color,
  size,
  textAlign = "center",
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
        style={{
          minWidth: 0,
          textAlign,
        }}
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
