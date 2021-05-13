import { Box, Drawer } from "@material-ui/core";
import List from "@material-ui/core/List";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import EnvironmentChip from "components/Shared/Chip/EnvironmentChip";
import BespokeFinancialLogo from "components/Shared/Layout/logo.png";
import NestedListItem from "components/Shared/Layout/NestedListItem";
import SidebarItem from "components/Shared/Layout/SidebarItem";
import UserMenu from "components/Shared/User/UserMenu";
import {
  CurrentUserContext,
  isRoleBankUser,
} from "contexts/CurrentUserContext";
import {
  ProductTypeEnum,
  useGetCompanyForCustomerBorrowingBaseQuery,
  useGetEbbaApplicationsCountForBankSubscription,
  useGetLoansCountForBankSubscription,
  useGetPaymentsCountForBankSubscription,
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

const DRAWER_WIDTH = 260;

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
  dataCy: string;
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
      dataCy: "overview",
      iconNode: OverviewIcon,
      text: "Overview",
      link: customerRoutes.overview,
    },
    {
      dataCy: "loans",
      visible: !!productType,
      iconNode: LoansIcon,
      text: "Loans",
      link: customerRoutes.loans,
    },
    {
      dataCy: "purchase-orders",
      visible:
        !!productType &&
        [
          ProductTypeEnum.InventoryFinancing,
          ProductTypeEnum.PurchaseMoneyFinancing,
        ].includes(productType),
      iconNode: PurchaseOrdersIcon,
      text: "Purchase Orders",
      link: customerRoutes.purchaseOrders,
    },
    {
      dataCy: "borrowing-base",
      visible:
        !!productType && [ProductTypeEnum.LineOfCredit].includes(productType),
      iconNode: PurchaseOrdersIcon,
      text: "Borrowing Base",
      link: customerRoutes.ebbaApplications,
      counter: showBorrowingBasesChip ? 1 : 0,
    },
    {
      dataCy: "invoices",
      visible:
        !!productType &&
        [
          ProductTypeEnum.InvoiceFinancing,
          ProductTypeEnum.PurchaseMoneyFinancing,
        ].includes(productType),
      iconNode: InvoicesIcon,
      text: "Invoices",
      link: customerRoutes.invoices,
    },
    {
      dataCy: "payments",
      iconNode: PaymentsIcon,
      text: "Payments",
      link: customerRoutes.payments,
    },
    {
      dataCy: "vendors",
      visible:
        !!productType &&
        [
          ProductTypeEnum.InventoryFinancing,
          ProductTypeEnum.LineOfCredit,
          ProductTypeEnum.PurchaseMoneyFinancing,
        ].includes(productType),
      iconNode: VendorsIcon,
      text: "Vendors",
      link: customerRoutes.vendors,
    },
    {
      dataCy: "payors",
      visible:
        !!productType &&
        [
          ProductTypeEnum.InvoiceFinancing,
          ProductTypeEnum.PurchaseMoneyFinancing,
        ].includes(productType),
      iconNode: PayorsIcon,
      text: "Payors",
      link: customerRoutes.payors,
    },
    {
      dataCy: "contract",
      iconNode: ContractsIcon,
      text: "Contract",
      link: customerRoutes.contract,
    },
    {
      dataCy: "settings",
      iconNode: SettingsIcon,
      text: "Settings",
      link: customerRoutes.settings,
    },
  ];
};

const getBankNavItems = (
  loansCount: number,
  paymentsCount: number,
  ebbaApplicationsCount: number
): NavItem[] => {
  return [
    {
      dataCy: "overview",
      iconNode: OverviewIcon,
      text: "Overview",
      link: bankRoutes.overview,
    },
    {
      dataCy: "loans",
      iconNode: LoansIcon,
      text: "Loans",
      link: bankRoutes.loans,
      counter: loansCount,
    },
    {
      dataCy: "payments",
      iconNode: PaymentsIcon,
      text: "Payments",
      link: bankRoutes.payments,
      counter: paymentsCount,
    },
    {
      dataCy: "purchase-orders",
      iconNode: PurchaseOrdersIcon,
      text: "Purchase Orders",
      link: bankRoutes.purchaseOrders,
    },
    {
      dataCy: "borrowing bases",
      iconNode: BorrowingBasesIcon,
      text: "Borrowing Bases",
      link: bankRoutes.ebbaApplications,
      counter: ebbaApplicationsCount,
    },
    {
      dataCy: "invoices",
      iconNode: InvoicesIcon,
      text: "Invoices",
      link: bankRoutes.invoices,
    },
    {
      dataCy: "customers",
      iconNode: CustomersIcon,
      text: "Customers",
      link: bankRoutes.customers,
    },
    {
      dataCy: "vendors",
      iconNode: VendorsIcon,
      text: "Vendors",
      link: bankRoutes.vendors,
    },
    {
      dataCy: "payors",
      iconNode: PayorsIcon,
      text: "Payors",
      link: bankRoutes.payors,
    },
    {
      dataCy: "partnerships",
      iconNode: PayorsIcon,
      text: "Partnerships",
      link: bankRoutes.partnerships,
    },
    {
      dataCy: "reports",
      iconNode: ReportsIcon,
      text: "Reports",
      link: bankRoutes.reports,
    },
    {
      dataCy: "settings",
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

export default function Layout({ appBarTitle, children }: Props) {
  useTitle(`${appBarTitle} | Bespoke`);

  const classes = useStyles();
  const location = useLocation();

  const {
    user: { role, productType, companyId },
  } = useContext(CurrentUserContext);
  const isBankUser = isRoleBankUser(role);

  const { data: loansCountData } = useGetLoansCountForBankSubscription({
    skip: !isBankUser,
  });

  const { data: paymentsCountData } = useGetPaymentsCountForBankSubscription({
    skip: !isBankUser,
  });

  const {
    data: ebbaApplicationsCountData,
  } = useGetEbbaApplicationsCountForBankSubscription({
    skip: !isBankUser,
  });

  const loansCount = loansCountData?.loans?.length || 0;
  const paymentsCount = paymentsCountData?.payments?.length || 0;
  const ebbaApplicationsCount =
    ebbaApplicationsCountData?.ebba_applications?.length || 0;

  const {
    data,
    loading: borrowingBaseLoading,
  } = useGetCompanyForCustomerBorrowingBaseQuery({
    skip: isBankUser,
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

  const navItems = isBankUser
    ? getBankNavItems(loansCount, paymentsCount, ebbaApplicationsCount)
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
                    dataCy={item.dataCy}
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
