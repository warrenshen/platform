import { AppBar, Box, Drawer, ListItem, ListItemText } from "@material-ui/core";
import List from "@material-ui/core/List";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import AccountBalanceIcon from "@material-ui/icons/AccountBalance";
import PaymentIcon from "@material-ui/icons/Payment";
import TuneIcon from "@material-ui/icons/Tune";
import NestedListItem from "components/Shared/Layout/NestedListItem";
import UserMenu from "components/Shared/User/UserMenu";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { ProductTypeEnum, UserRolesEnum } from "generated/graphql";
import { getLoanNameByProductType } from "lib/finance/loans/loans";
import { bankRoutes, customerRoutes, routes } from "lib/routes";
import { ReactNode, useContext } from "react";
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
    list: {
      padding: 0,
    },
    listItemText: {
      fontWeight: 500,
    },
  })
);

// If NavItem contains a link, we assume it to not be nested (items will not exist).
// If NavItem does not contain a link, we assume it to be nested (items will exist).
type NavItem = {
  text: string;
  link?: string;
  icon?: ReactNode;
  counter?: number;
  items?: NavItem[];
};

const getCustomerNavItems = (productType: ProductTypeEnum): NavItem[] => {
  return [
    {
      text: "Overview",
      link: customerRoutes.overview,
    },
    {
      text: `${getLoanNameByProductType(productType)}s`,
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

const getBankNavItems = (): NavItem[] => {
  return [
    {
      text: "Overview",
      link: bankRoutes.overview,
    },
    {
      text: "Loans",
      counter: 0,
      items: [
        {
          text: "All",
          link: bankRoutes.loansAllProducts,
          icon: <AccountBalanceIcon />,
        },
        {
          text: "Action Required",
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
};

interface Props {
  appBarTitle: string;
  children: ReactNode;
}

function Layout({ appBarTitle, children }: Props) {
  useTitle(`${appBarTitle} | Bespoke`);

  const classes = useStyles();
  const location = useLocation();
  const {
    user: { role, productType },
  } = useContext(CurrentUserContext);

  const navItems =
    role === UserRolesEnum.BankAdmin
      ? getBankNavItems()
      : productType
      ? getCustomerNavItems(productType)
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
        <Box className={classes.toolbar}>
          <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="Logo" />
        </Box>
        <List className={classes.list}>
          {navItems.map((item, index) =>
            item.link ? (
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
            ) : (
              <NestedListItem key={item.text + index} item={item} />
            )
          )}
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
