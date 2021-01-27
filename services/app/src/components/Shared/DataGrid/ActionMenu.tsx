import { IconButton, Menu, MenuItem } from "@material-ui/core";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import { useState } from "react";

interface Props {
  handleClickEdit: () => void;
}

function ActionMenu({ handleClickEdit }: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton onClick={handleClick}>
        <ArrowDropDownIcon></ArrowDropDownIcon>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem
          onClick={() => {
            handleClickEdit();
            handleClose();
          }}
        >
          Edit
        </MenuItem>
      </Menu>
    </>
  );
}

export default ActionMenu;
