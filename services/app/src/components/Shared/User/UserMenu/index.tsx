import {
  ApolloClient,
  NormalizedCacheObject,
  useApolloClient,
} from "@apollo/client";
import { Box, IconButton, Menu, MenuItem, Typography } from "@material-ui/core";
import { AccountCircle } from "@material-ui/icons";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { UserRolesEnum, useUserByIdQuery } from "generated/graphql";
import { routes } from "lib/routes";
import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

const Email = styled.span`
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
`;

function UserMenu() {
  const client = useApolloClient() as ApolloClient<NormalizedCacheObject>;
  const { user: currentUser, signOut } = useContext(CurrentUserContext);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const { data } = useUserByIdQuery({
    variables: {
      id: currentUser.id,
    },
  });

  const user = data?.users_by_pk;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box>
      <Box display="flex" flexDirection="row" alignItems="center" py={2} px={1}>
        <Box>
          <IconButton onClick={handleClick}>
            <AccountCircle />
          </IconButton>
        </Box>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          flex={1}
          ml={1}
          overflow="hidden"
        >
          <Typography variant="button">
            {user?.role === UserRolesEnum.BankAdmin
              ? "Bespoke (Bank)"
              : user?.company?.name}
          </Typography>
          <Email>{user?.email}</Email>
        </Box>
      </Box>
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
    </Box>
  );
}

export default UserMenu;
