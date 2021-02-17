import {
  Box,
  Divider,
  ListItem,
  ListItemText,
  Drawer,
  AppBar,
} from "@material-ui/core";
import AccountBalanceIcon from "@material-ui/icons/AccountBalance";
import PaymentIcon from "@material-ui/icons/Payment";
import List from "@material-ui/core/List";
import TuneIcon from "@material-ui/icons/Tune";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import UserMenu from "components/Shared/User/UserMenu";
import NestedListItem from "components/Shared/Layout/NestedListItem";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { ProductTypeEnum, UserRolesEnum } from "generated/graphql";
import { bankRoutes, customerRoutes, routes } from "lib/routes";
import React, { useContext } from "react";
import { Link, matchPath, useLocation } from "react-router-dom";
import { useTitle } from "react-use";

const DRAWER_WIDTH = 250;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
      width: "100vw",
      height: "100vh",
    },
    appBar: {
      width: `calc(100% - ${DRAWER_WIDTH}px)`,
      marginLeft: DRAWER_WIDTH,
    },
    drawer: {
      width: DRAWER_WIDTH,
    },
    drawerPaper: {
      width: DRAWER_WIDTH,
    },
    // necessary for content to be below app bar
    toolbar: {
      ...theme.mixins.toolbar,
      display: "flex",
      justifyContent: "space-between",
      paddingRight: "12px",
    },
    content: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "stretch",
      backgroundColor: theme.palette.background.default,
      overflow: "scroll",
    },
    listItemText: {
      fontWeight: 500,
    },
  })
);

const getCustomerLeftNavItems = (productType: ProductTypeEnum) => {
  return [
    {
      text: "Overview",
      link: customerRoutes.overview,
    },
    {
      text:
        productType === ProductTypeEnum.LineOfCredit ? "Drawdowns" : "Loans",
      link: customerRoutes.loans,
    },
    ...(productType === ProductTypeEnum.InventoryFinancing
      ? [
          {
            text: "Purchase Orders",
            link: customerRoutes.purchaseOrders,
          },
        ]
      : []),
    ...(productType === ProductTypeEnum.LineOfCredit
      ? [
          {
            text: "Borrowing Base",
            link: customerRoutes.ebbaApplications,
          },
        ]
      : []),
    {
      text: "Vendors",
      link: customerRoutes.vendors,
    },
    {
      text: "Company Profile",
      link: customerRoutes.companyProfile,
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
};

const BANK_LEFT_NAV_ITEMS = [
  {
    text: "Overview",
    link: bankRoutes.overview,
  },
  {
    text: "Loans",
    counter: 4,
    items: [
      {
        text: "All",
        link: bankRoutes.loansAllProducts,
        icon: <AccountBalanceIcon />,
      },
      {
        text: "Approval Requested",
        counter: 4,
        link: bankRoutes.loansApprovalRequested,
        icon: <AccountBalanceIcon />,
      },
      {
        text: "Maturing in X Days",
        link: bankRoutes.loansMaturing,
        icon: <AccountBalanceIcon />,
      },
      {
        text: "Past Due (Collections)",
        link: bankRoutes.loansPastDue,
        icon: <AccountBalanceIcon />,
      },
      // {
      //   text: "Loans by Purchase Order",
      //   link: bankRoutes.loansPurchaseOrder,
      // },
      // {
      //   text: "Loans by Line of Credit",
      //   link: bankRoutes.loansLineOfCredit,
      // },
    ],
  },
  {
    text: "Purchase Orders",
    link: bankRoutes.purchaseOrders,
  },
  {
    text: "Borrowing Bases",
    link: bankRoutes.ebbaApplications,
  },
  {
    text: "Advances",
    link: bankRoutes.advances,
  },
  {
    text: "Payments",
    items: [
      {
        text: "All",
        link: bankRoutes.payments,
        icon: <PaymentIcon />,
      },
      {
        text: "Reverse Draft ACH",
        link: bankRoutes.paymentsReverseDraftAch,
        icon: <PaymentIcon />,
      },
      {
        text: "Ready for Settlement",
        link: bankRoutes.paymentsReadyForSettlement,
        icon: <PaymentIcon />,
      },
    ],
  },
  {
    text: "Transactions",
    link: bankRoutes.transactions,
  },
  {
    text: "Customers",
    link: bankRoutes.customers,
  },
  {
    text: "Vendors",
    link: bankRoutes.vendors,
  },
  {
    text: "Settings",
    items: [
      {
        text: "Users",
        link: routes.users,
        icon: <TuneIcon />,
      },
      {
        text: "Bank Accounts",
        link: bankRoutes.bankAccounts,
        icon: <TuneIcon />,
      },
    ],
  },
];

interface Props {
  appBarTitle: string;
  children: React.ReactNode;
}

function Layout({ appBarTitle, children }: Props) {
  useTitle(`${appBarTitle} | Bespoke`);

  const classes = useStyles();
  const location = useLocation();
  const {
    user: { role, productType },
  } = useContext(CurrentUserContext);

  const leftNavOptions: any =
    role === UserRolesEnum.BankAdmin
      ? BANK_LEFT_NAV_ITEMS
      : productType
      ? getCustomerLeftNavItems(productType)
      : [];

  return (
    <div className={classes.root}>
      <AppBar position="fixed" className={classes.appBar} color="inherit">
        <Toolbar className={classes.toolbar}>
          <Box>
            <Typography variant="h6" noWrap>
              {appBarTitle}
            </Typography>
          </Box>
          <Box>
            <UserMenu />
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
        <Divider />
        <List>
          {leftNavOptions.map((item: any, index: number) => {
            return item.items ? (
              <NestedListItem key={item.text + index} item={item} />
            ) : (
              <ListItem
                key={item.text + index}
                button
                component={Link}
                to={item.link}
                selected={Boolean(matchPath(location.pathname, item.link))}
              >
                <ListItemText
                  primaryTypographyProps={{
                    className: classes.listItemText,
                    variant: "subtitle1",
                  }}
                >
                  {item.text}
                </ListItemText>
              </ListItem>
            );
          })}
        </List>
      </Drawer>
      <main className={classes.content}>
        <div className={classes.toolbar} />
        {children}
      </main>
    </div>
  );
}

export default Layout;
