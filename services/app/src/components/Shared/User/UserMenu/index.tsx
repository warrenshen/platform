import {
  ApolloClient,
  NormalizedCacheObject,
  useApolloClient,
} from "@apollo/client";
import { IconButton, Menu, MenuItem } from "@material-ui/core";
import { AccountCircle } from "@material-ui/icons";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { routes } from "lib/routes";

function UserMenu() {
  const client = useApolloClient() as ApolloClient<NormalizedCacheObject>;
  const { signOut } = useContext(CurrentUserContext);
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
        <MenuItem
          component={Link}
          to={routes.userProfile}
          onClick={handleClose}
        >
          Profile
        </MenuItem>
        <MenuItem
          onClick={() => {
            signOut(client);
            handleClose();
          }}
        >
          Logout
        </MenuItem>
      </Menu>
    </>
  );
}

export default UserMenu;
