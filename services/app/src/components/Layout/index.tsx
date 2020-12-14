import { Box, Divider, ListItem, ListItemText } from "@material-ui/core";
import AppBar from "@material-ui/core/AppBar";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import UserProfile from "components/UserProfile";
import { CurrentUserContext, UserRole } from "contexts/CurrentUserContext";
import { PageContext } from "contexts/PageContext";
import React, { useContext, useState } from "react";
import { Link, matchPath, useLocation } from "react-router-dom";
import { bankRoutes, routes } from "routes";

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
    link: routes.loans,
  },
  {
    text: "Purchase Orders",
    link: routes.purchaseOrders,
  },
  {
    text: "Vendors",
    link: routes.vendors,
  },
  {
    text: "Profile",
    link: routes.profile,
  },
];

const BANK_LEFT_NAV_ITEMS = [
  {
    text: "Overview",
    link: routes.overview,
  },
  {
    text: "Loans",
    link: routes.loans,
  },
  {
    text: "Vendors",
    link: routes.vendors,
  },
  {
    text: "Customers",
    link: bankRoutes.customers,
  },
];

function Layout(props: { children: React.ReactNode }) {
  const classes = useStyles();
  const location = useLocation();
  const currentUser = useContext(CurrentUserContext);
  const [appBarTitle, setAppBarTitle] = useState<React.ReactNode | string>("");

  const leftNavOptions =
    currentUser.role === UserRole.Bank
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
              <UserProfile></UserProfile>
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
            <img src="./logo.png" alt="Logo" />
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
