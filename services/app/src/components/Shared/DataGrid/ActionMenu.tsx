import { Box, IconButton, Menu, MenuItem } from "@material-ui/core";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import { useState } from "react";

type ActionItem = {
  key: string;
  label: string;
  handleClick: () => void;
};
interface Props {
  actionItems: ActionItem[];
}

function ActionMenu({ actionItems }: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box display="flex" flexDirection="column">
      <IconButton onClick={handleClick}>
        <ArrowDropDownIcon></ArrowDropDownIcon>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {actionItems.map((actionItem) => (
          <MenuItem
            key={actionItem.key}
            onClick={() => {
              actionItem.handleClick();
              handleClose();
            }}
          >
            {actionItem.label}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}

export default ActionMenu;
