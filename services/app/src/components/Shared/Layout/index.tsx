import {
  AppBar,
  Box,
  Chip,
  Drawer,
  ListItem,
  ListItemText,
} from "@material-ui/core";
import List from "@material-ui/core/List";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import AccountBalanceIcon from "@material-ui/icons/AccountBalance";
import PaymentIcon from "@material-ui/icons/Payment";
import TuneIcon from "@material-ui/icons/Tune";
import EnvironmentChip from "components/Shared/Chip/EnvironmentChip";
import NestedListItem from "components/Shared/Layout/NestedListItem";
import UserMenu from "components/Shared/User/UserMenu";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  ProductTypeEnum,
  useGetCompanyForCustomerBorrowingBaseQuery,
  UserRolesEnum,
} from "generated/graphql";
import { withinNDaysOfNowOrBefore } from "lib/date";
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
      alignItems: "center",
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
    chipCounter: {
      marginLeft: "0.5rem",
      fontWeight: 600,
      marginBottom: "3px",
      letterSpacing: "1px",
      transform: "scale(0.9)",
    },
  })
);

// If NavItem contains a link, we assume it to not be nested (items will not exist).
// If NavItem does not contain a link, we assume it to be nested (items will exist).
type NavItem = {
  visible?: boolean;
  text: string;
  link?: string;
  icon?: ReactNode;
  counter?: number;
  items?: NavItem[];
};

const getCustomerNavItems = (
  productType: ProductTypeEnum | null,
  showBorrowingBasesChip?: boolean
): NavItem[] => {
  return [
    {
      text: "Overview",
      link: customerRoutes.overview,
    },
    {
      visible: productType !== null,
      text: "Loans",
      items: [
        {
          text: "Loans - Active",
          link: customerRoutes.loansActive,
          icon: <PaymentIcon />,
        },
        {
          text: "Loans - Closed",
          link: customerRoutes.loansClosed,
          icon: <PaymentIcon />,
        },
      ],
    },
    {
      visible: productType === ProductTypeEnum.InventoryFinancing,
      text: "Purchase Orders",
      link: customerRoutes.purchaseOrders,
    },
    {
      visible: productType === ProductTypeEnum.LineOfCredit,
      text: "Borrowing Base",
      link: customerRoutes.ebbaApplications,
      counter: showBorrowingBasesChip ? 1 : 0,
    },
    {
      visible: productType === ProductTypeEnum.InvoiceFinancing,
      text: "Invoices",
      link: customerRoutes.invoices,
    },
    {
      visible: productType !== ProductTypeEnum.InvoiceFinancing,
      text: "Vendors",
      link: customerRoutes.vendors,
    },
    {
      visible: productType === ProductTypeEnum.InvoiceFinancing,
      text: "Payors",
      link: customerRoutes.payors,
    },
    {
      text: "Contract",
      link: customerRoutes.contract,
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
          link: bankRoutes.loansActionRequired,
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
      ],
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
          text: "Action Required",
          link: bankRoutes.paymentsActionRequired,
          icon: <PaymentIcon />,
        },
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
      text: "Invoices",
      link: bankRoutes.invoices,
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
      text: "Payors",
      link: bankRoutes.payors,
    },
    {
      text: "Advances",
      link: bankRoutes.advances,
    },
    {
      text: "Transactions",
      link: bankRoutes.transactions,
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
    user: { role, productType, companyId },
  } = useContext(CurrentUserContext);

  const {
    data,
    loading: borrowingBaseLoading,
  } = useGetCompanyForCustomerBorrowingBaseQuery({
    variables: {
      companyId,
    },
  });

  const ebbaApplication =
    data?.companies_by_pk?.settings?.active_ebba_application;

  const showBorrowingBasesChip =
    !borrowingBaseLoading &&
    (!ebbaApplication ||
      withinNDaysOfNowOrBefore(ebbaApplication.expires_at, 15));

  const navItems = [
    UserRolesEnum.BankAdmin,
    UserRolesEnum.BankReadOnly,
  ].includes(role)
    ? getBankNavItems()
    : getCustomerNavItems(productType, showBorrowingBasesChip);

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
        <Box display="flex" alignItems="center" minHeight={64} pl={1} pr={1}>
          <img
            src={`${process.env.PUBLIC_URL}/logo.png`}
            alt="Logo"
            width={150}
            height={53}
          />
          <Box ml={1.5}>
            <EnvironmentChip />
          </Box>
        </Box>
        <List className={classes.list}>
          {navItems
            .filter((customerPath) => customerPath.visible !== false)
            .map((item, index) =>
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
                    {!!item.counter && (
                      <Chip
                        size="small"
                        color="secondary"
                        className={classes.chipCounter}
                        label={item.counter}
                      />
                    )}
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
