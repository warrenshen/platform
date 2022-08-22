import { Box, IconButton } from "@material-ui/core";
import { ReactNode, useState } from "react";

interface Props {
  children: ReactNode;
  dataCy?: string;
  isDisabled?: boolean;
  color?: "inherit" | "primary" | "secondary" | "default" | undefined;
  size?: "small" | "medium";
  textAlign?: "left" | "center" | "right";
  handleClick?: ({ handleOpen }: { handleOpen: () => void }) => void;
  modal: ({ handleClose }: { handleClose: () => void }) => ReactNode;
}

export default function ModalIconButton({
  children,
  dataCy,
  isDisabled = false,
  color,
  size,
  textAlign = "center",
  handleClick,
  modal,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Box>
      {isOpen && modal({ handleClose: () => setIsOpen(false) })}
      <IconButton
        data-cy={dataCy}
        disabled={isOpen || isDisabled}
        color={color || "primary"}
        size={size || "medium"}
        style={{
          minWidth: 0,
          padding: 8,
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
        {children}
      </IconButton>
    </Box>
  );
}
