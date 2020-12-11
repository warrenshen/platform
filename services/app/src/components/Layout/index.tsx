import { Box, Divider, ListItem, ListItemText } from "@material-ui/core";
import AppBar from "@material-ui/core/AppBar";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import UserProfile from "components/UserProfile";
import React from "react";
import { Link, matchPath, useLocation } from "react-router-dom";
import routes from "routes";

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
    text: "Partners",
    link: routes.partners,
  },
  {
    text: "Profile",
    link: routes.profile,
  },
];

function Layout(props: { children: React.ReactNode }) {
  const classes = useStyles();
  const location = useLocation();

  return (
    <div className={classes.root}>
      <AppBar position="fixed" className={classes.appBar} color="inherit">
        <Toolbar className={classes.toolbar}>
          <Box>
            <Typography variant="h6" noWrap>
              Page Title
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
          {CUSTOMER_LEFT_NAV_ITEMS.map((item) => {
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
  );
}

export default Layout;
