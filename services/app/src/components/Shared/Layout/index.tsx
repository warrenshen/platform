import { Box, Drawer } from "@material-ui/core";
import List from "@material-ui/core/List";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import EnvironmentChip from "components/Shared/Chip/EnvironmentChip";
import BespokeFinancialLogo from "components/Shared/Layout/logo.png";
import NestedListItem from "components/Shared/Layout/NestedListItem";
import SidebarItem from "components/Shared/Layout/SidebarItem";
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
import { matchPath, useLocation } from "react-router-dom";
import { useTitle } from "react-use";
import styled from "styled-components";
import { ReactComponent as BorrowingBasesIcon } from "./Icons/BorrowingBases.svg";
import { ReactComponent as ContractsIcon } from "./Icons/Contracts.svg";
import { ReactComponent as CustomersIcon } from "./Icons/Customers.svg";
import { ReactComponent as InvoicesIcon } from "./Icons/Invoices.svg";
import { ReactComponent as LoansIcon } from "./Icons/Loans.svg";
import { ReactComponent as OverviewIcon } from "./Icons/Overview.svg";
import { ReactComponent as PaymentsIcon } from "./Icons/Payments.svg";
import { ReactComponent as PayorsIcon } from "./Icons/Payors.svg";
import { ReactComponent as PurchaseOrdersIcon } from "./Icons/PurchaseOrders.svg";
import { ReactComponent as ReportsIcon } from "./Icons/Reports.svg";
import { ReactComponent as SettingsIcon } from "./Icons/Settings.svg";
import { ReactComponent as VendorsIcon } from "./Icons/Vendors.svg";

const Wrapper = styled.div`
  display: flex;
  width: 100vw;
  height: 100vh;
`;

const Logo = styled.a`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 96px;
`;

const SidebarItems = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  overflow: scroll;
`;

const Content = styled.main`
  display: flex;
  flexdirection: column;
  alignitems: stretch;

  flex: 1;

  background-color: #f6f5f3;
  overflow: scroll;
`;

const Footer = styled.div`
  display: flex;
  flex-direction: column;
`;

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
      border: "0px",
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
  })
);

// If NavItem contains a link, we assume it to not be nested (items will not exist).
// If NavItem does not contain a link, we assume it to be nested (items will exist).
type NavItem = {
  visible?: boolean;
  text: string;
  link?: string;
  iconNode?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  icon?: ReactNode;
  iconPath?: string;
  counter?: number;
  items?: NavItem[];
};

const getCustomerNavItems = (
  productType: ProductTypeEnum | null,
  showBorrowingBasesChip?: boolean
): NavItem[] => {
  return [
    {
      iconNode: OverviewIcon,
      text: "Overview",
      link: customerRoutes.overview,
    },
    {
      visible: productType !== null,
      iconNode: LoansIcon,
      text: "Loans",
      link: customerRoutes.loans,
    },
    {
      visible:
        productType === ProductTypeEnum.InventoryFinancing ||
        productType === ProductTypeEnum.PurchaseMoneyFinancing,
      iconNode: PurchaseOrdersIcon,
      text: "Purchase Orders",
      link: customerRoutes.purchaseOrders,
    },
    {
      visible: productType === ProductTypeEnum.LineOfCredit,
      iconNode: PurchaseOrdersIcon,
      text: "Borrowing Base",
      link: customerRoutes.ebbaApplications,
      counter: showBorrowingBasesChip ? 1 : 0,
    },
    {
      visible:
        productType === ProductTypeEnum.InvoiceFinancing ||
        productType === ProductTypeEnum.PurchaseMoneyFinancing,
      iconNode: InvoicesIcon,
      text: "Invoices",
      link: customerRoutes.invoices,
    },
    {
      visible: productType !== ProductTypeEnum.InvoiceFinancing,
      iconNode: VendorsIcon,
      text: "Vendors",
      link: customerRoutes.vendors,
    },
    {
      visible:
        productType === ProductTypeEnum.InvoiceFinancing ||
        productType === ProductTypeEnum.PurchaseMoneyFinancing,
      iconNode: PayorsIcon,
      text: "Payors",
      link: customerRoutes.payors,
    },
    {
      iconNode: ContractsIcon,
      text: "Contract",
      link: customerRoutes.contract,
    },
    {
      iconNode: SettingsIcon,
      text: "Settings",
      link: customerRoutes.settings,
    },
  ];
};

const getBankNavItems = (): NavItem[] => {
  return [
    {
      iconNode: OverviewIcon,
      text: "Overview",
      link: bankRoutes.overview,
    },
    {
      iconNode: LoansIcon,
      text: "Loans",
      link: bankRoutes.loans,
    },
    {
      iconNode: PaymentsIcon,
      text: "Payments",
      link: bankRoutes.payments,
    },
    {
      iconNode: PurchaseOrdersIcon,
      text: "Purchase Orders",
      link: bankRoutes.purchaseOrders,
    },
    {
      iconNode: BorrowingBasesIcon,
      text: "Borrowing Bases",
      link: bankRoutes.ebbaApplications,
    },
    {
      iconNode: InvoicesIcon,
      text: "Invoices",
      link: bankRoutes.invoices,
    },
    {
      iconNode: CustomersIcon,
      text: "Customers",
      link: bankRoutes.customers,
    },
    {
      iconNode: VendorsIcon,
      text: "Vendors",
      link: bankRoutes.vendors,
    },
    {
      iconNode: PayorsIcon,
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
      iconNode: ReportsIcon,
      text: "Reports",
      link: bankRoutes.reports,
    },
    {
      iconNode: SettingsIcon,
      text: "Settings",
      link: bankRoutes.settings,
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
    <Wrapper>
      <Drawer
        className={classes.drawer}
        variant="permanent"
        classes={{
          paper: classes.drawerPaper,
        }}
        anchor="left"
      >
        <Logo href={routes.root}>
          <img
            src={BespokeFinancialLogo}
            alt="Bespoke Financial Logo"
            width={156}
            height={32}
          />
        </Logo>
        <SidebarItems>
          <List className={classes.list}>
            {navItems
              .filter((customerPath) => customerPath.visible !== false)
              .map((item, index) =>
                item.link ? (
                  <SidebarItem
                    key={item.text + index}
                    isSelected={Boolean(
                      matchPath(location.pathname, item.link)
                    )}
                    chipCount={item.counter || null}
                    IconNode={item.iconNode || null}
                    label={item.text}
                    to={item.link}
                  />
                ) : (
                  <NestedListItem key={item.text + index} item={item} />
                )
              )}
          </List>
        </SidebarItems>
        <Footer>
          <Box>
            <EnvironmentChip />
          </Box>
          <Box>
            <UserMenu />
          </Box>
        </Footer>
      </Drawer>
      <Content>{children}</Content>
    </Wrapper>
  );
}

export default Layout;
