import { Box, Divider, ListItem, ListItemText } from "@material-ui/core";
import AppBar from "@material-ui/core/AppBar";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import UserMenu from "components/Shared/User/UserMenu";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { PageContext } from "contexts/PageContext";
import { UserRolesEnum } from "generated/graphql";
import { bankRoutes, customerRoutes, routes } from "lib/routes";
import React, { useContext, useState } from "react";
import { Link, matchPath, useLocation } from "react-router-dom";

const DRAWER_WIDTH = 240;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
    },
    appBar: {
      width: `calc(100% - ${DRAWER_WIDTH}px)`,
      marginLeft: DRAWER_WIDTH,
    },
    drawer: {
      width: DRAWER_WIDTH,
      flexShrink: 0,
    },
    drawerPaper: {
      width: DRAWER_WIDTH,
    },
    // necessary for content to be below app bar
    toolbar: {
      ...theme.mixins.toolbar,
      display: "flex",
      justifyContent: "space-between",
    },
    content: {
      flexGrow: 1,
      backgroundColor: theme.palette.background.default,
      padding: theme.spacing(3),
    },
  })
);

const CUSTOMER_LEFT_NAV_ITEMS = [
  {
    text: "Overview",
    link: routes.overview,
  },
  {
    text: "Loans",
    link: customerRoutes.loans,
  },
  {
    text: "Purchase Orders",
    link: customerRoutes.purchaseOrders,
  },
  {
    text: "Vendors",
    link: routes.vendors,
  },
  {
    text: "Profile",
    link: routes.profile,
  },
  {
    text: "Users",
    link: routes.users,
  },
  {
    text: "Settings",
    link: customerRoutes.settings,
  },
];

const BANK_LEFT_NAV_ITEMS = [
  {
    text: "Overview",
    link: routes.overview,
  },
  {
    text: "Vendors",
    link: routes.vendors,
  },
  {
    text: "Customers",
    link: bankRoutes.customers,
  },
  {
    text: "Users",
    link: routes.users,
  },
  {
    text: "Bank Accounts",
    link: bankRoutes.bankAccounts,
  },
];

function Layout(props: { children: React.ReactNode }) {
  const classes = useStyles();
  const location = useLocation();
  const { user } = useContext(CurrentUserContext);
  const [appBarTitle, setAppBarTitle] = useState<React.ReactNode | string>("");

  const leftNavOptions =
    user.role === UserRolesEnum.BankAdmin
      ? BANK_LEFT_NAV_ITEMS
      : CUSTOMER_LEFT_NAV_ITEMS;

  return (
    <PageContext.Provider
      value={{
        setAppBarTitle,
      }}
    >
      <div className={classes.root}>
        <AppBar position="fixed" className={classes.appBar} color="inherit">
          <Toolbar className={classes.toolbar}>
            <Box>
              <Typography variant="h6" noWrap>
                {appBarTitle}
              </Typography>
            </Box>
            <Box>
              <UserMenu></UserMenu>
            </Box>
          </Toolbar>
        </AppBar>
        <Drawer
          className={classes.drawer}
          variant="permanent"
          classes={{
            paper: classes.drawerPaper,
          }}
          anchor="left"
        >
          <div className={classes.toolbar}>
            <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="Logo" />
          </div>
          <Divider></Divider>
          <List>
            {leftNavOptions.map((item) => {
              return (
                <ListItem
                  key={item.link}
                  button
                  component={Link}
                  to={item.link}
                  selected={Boolean(matchPath(location.pathname, item.link))}
                >
                  <ListItemText>{item.text}</ListItemText>
                </ListItem>
              );
            })}
          </List>
        </Drawer>
        <main className={classes.content}>
          <div className={classes.toolbar} />
          {props.children}
        </main>
      </div>
    </PageContext.Provider>
  );
}

export default Layout;
