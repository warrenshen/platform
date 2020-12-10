import { IconButton, Menu, MenuItem } from "@material-ui/core";
import { AccountCircle } from "@material-ui/icons";
import { CurrentUserContext, UserRole } from "contexts/CurrentUserContext";
import { useContext, useState } from "react";

function UserProfile() {
  const currentUser = useContext(CurrentUserContext);
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
        <AccountCircle></AccountCircle>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={handleClose}>Profile ({currentUser.role})</MenuItem>
        <MenuItem
          onClick={() => {
            currentUser.setRole(UserRole.Bank);
            handleClose();
          }}
        >
          Sign in as Bank
        </MenuItem>
        <MenuItem
          onClick={() => {
            currentUser.setRole(UserRole.Customer);
            handleClose();
          }}
        >
          Sign in as Customer
        </MenuItem>
      </Menu>
    </>
  );
}

export default UserProfile;