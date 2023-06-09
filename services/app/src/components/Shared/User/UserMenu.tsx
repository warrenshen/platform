import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@material-ui/core";
import { AccountCircle } from "@material-ui/icons";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { useGetUserMenuInfoQuery } from "generated/graphql";
import useSnackbar from "hooks/useSnackbar";
import { PlatformModeEnum } from "lib/enum";
import { bankRoutes, customerRoutes, routes } from "lib/routes";
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";

const LocationBanner = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 8px 12px;
  background-color: rgba(203, 166, 121, 1);
  color: white;
`;

const Email = styled.span`
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const LocationName = styled.span`
  color: white;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const Switch = styled.span`
  color: white;
`;

interface Props {
  isLocationsPage?: boolean;
}

export default function UserMenu({ isLocationsPage }: Props) {
  const snackbar = useSnackbar();
  const {
    user: {
      id: userId,
      companyId,
      impersonatorUserId,
      isEmbeddedModule,
      platformMode,
    },
    signOut,
    undoImpersonation,
  } = useContext(CurrentUserContext);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const { data, error } = useGetUserMenuInfoQuery({
    variables: {
      user_id: userId,
    },
  });

  if (error) {
    alert(`Error in query: ${error.message}`);
    console.error({ error });
  }

  const user = data?.users_by_pk;
  const parentCompany = user?.parent_company;
  const customerCompanies = parentCompany?.customer_companies || [];
  const customerCompany =
    customerCompanies.find(
      (customerCompany) => customerCompany.id === companyId
    ) || null;
  const isMultiLocation = customerCompanies.length > 1;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleUndoImpersonationClick = async () => {
    const errorMsg = await undoImpersonation();

    if (errorMsg) {
      return snackbar.showError("Could not undo impersonation: ", errorMsg);
    }
    navigate(bankRoutes.settings);
  };

  return (
    <Box display="flex" flexDirection="column">
      {!isLocationsPage && isMultiLocation && parentCompany && customerCompany && (
        <LocationBanner>
          <LocationName>{customerCompany.name}</LocationName>
          <Button
            onClick={() => navigate(customerRoutes.locations)}
            data-cy={"switch-location-button"}
          >
            <Switch>
              <strong>Switch</strong>
            </Switch>
          </Button>
        </LocationBanner>
      )}
      <Box display="flex" flexDirection="row" alignItems="center" py={2} px={1}>
        <Box>
          <IconButton
            onClick={handleClick}
            data-cy={"user-profile-icon-button"}
          >
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
            {platformMode === PlatformModeEnum.Bank
              ? "Bespoke (Bank)"
              : isMultiLocation
              ? `${parentCompany?.name} (${customerCompanies.length} locations)`
              : customerCompany?.name}
          </Typography>
          <Email>{user?.email}</Email>
        </Box>
      </Box>
      <Menu
        data-cy={"user-context-menu"}
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
        {/* TODO: fix this */}
        {true && !!impersonatorUserId && (
          <MenuItem
            data-cy={"undo-impersonation-button"}
            onClick={handleUndoImpersonationClick}
          >
            Undo impersonation
          </MenuItem>
        )}
        {!isEmbeddedModule && (
          <MenuItem
            data-cy={"user-logout-button"}
            onClick={() => {
              signOut();
              handleClose();
            }}
          >
            Logout
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
}
