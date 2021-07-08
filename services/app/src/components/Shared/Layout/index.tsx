import { Box, Drawer } from "@material-ui/core";
import List from "@material-ui/core/List";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import EnvironmentChip from "components/Shared/Chip/EnvironmentChip";
import { ReactComponent as BorrowingBasesIcon } from "components/Shared/Layout/Icons/BorrowingBases.svg";
import { ReactComponent as ContractsIcon } from "components/Shared/Layout/Icons/Contracts.svg";
import { ReactComponent as CustomersIcon } from "components/Shared/Layout/Icons/Customers.svg";
import { ReactComponent as InvoicesIcon } from "components/Shared/Layout/Icons/Invoices.svg";
import { ReactComponent as LoansIcon } from "components/Shared/Layout/Icons/Loans.svg";
import { ReactComponent as OverviewIcon } from "components/Shared/Layout/Icons/Overview.svg";
import { ReactComponent as RepaymentsIcon } from "components/Shared/Layout/Icons/Payments.svg";
import { ReactComponent as PayorsIcon } from "components/Shared/Layout/Icons/Payors.svg";
import { ReactComponent as PurchaseOrdersIcon } from "components/Shared/Layout/Icons/PurchaseOrders.svg";
import { ReactComponent as ReportsIcon } from "components/Shared/Layout/Icons/Reports.svg";
import { ReactComponent as SettingsIcon } from "components/Shared/Layout/Icons/Settings.svg";
import { ReactComponent as VendorsIcon } from "components/Shared/Layout/Icons/Vendors.svg";
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
  useGetPartnershipRequestsCountForBankSubscription,
  useGetRepaymentsCountForBankSubscription,
} from "generated/graphql";
import { withinNDaysOfNowOrBefore } from "lib/date";
import { bankRoutes, customerRoutes, routes } from "lib/routes";
import { isPayorsTabVisible, isVendorsTabVisible } from "lib/settings";
import { ReactNode, useContext } from "react";
import { matchPath, useLocation } from "react-router-dom";
import { useTitle } from "react-use";
import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
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

  overflow-y: scroll;
`;

const Content = styled.main`
  display: flex;
  flex-direction: column;
  align-items: stretch;

  width: calc(100% - 260px);
  background-color: #f6f5f3;
  overflow-y: scroll;
`;

const Footer = styled.div`
  display: flex;
  flex-direction: column;
`;

const DRAWER_WIDTH = 260;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    drawer: {
      width: DRAWER_WIDTH,
      height: "100%",
    },
    drawerPaper: {
      width: DRAWER_WIDTH,
      border: "0px",
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
      dataCy: "repayments",
      iconNode: RepaymentsIcon,
      text: "Repayments",
      link: customerRoutes.payments,
    },
    {
      dataCy: "vendors",
      visible: isVendorsTabVisible(productType),
      iconNode: VendorsIcon,
      text: "Vendors",
      link: customerRoutes.vendors,
    },
    {
      dataCy: "payors",
      visible: isPayorsTabVisible(productType),
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
  repaymentsCount: number,
  ebbaApplicationsCount: number,
  partnershipRequestsCount: number
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
      dataCy: "repayments",
      iconNode: RepaymentsIcon,
      text: "Repayments",
      link: bankRoutes.payments,
      counter: repaymentsCount,
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
      counter: partnershipRequestsCount,
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

  const {
    data: repaymentsCountData,
  } = useGetRepaymentsCountForBankSubscription({
    skip: !isBankUser,
  });

  const {
    data: partnershipRequestsCountData,
  } = useGetPartnershipRequestsCountForBankSubscription({
    skip: !isBankUser,
  });

  const {
    data: ebbaApplicationsCountData,
  } = useGetEbbaApplicationsCountForBankSubscription({
    skip: !isBankUser,
  });

  const loansCount = loansCountData?.loans?.length || 0;
  const repaymentsCount = repaymentsCountData?.payments?.length || 0;
  const ebbaApplicationsCount =
    ebbaApplicationsCountData?.ebba_applications?.length || 0;
  const partnershipRequestsCount =
    partnershipRequestsCountData?.company_partnership_requests?.length || 0;

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
    ? getBankNavItems(
        loansCount,
        repaymentsCount,
        ebbaApplicationsCount,
        partnershipRequestsCount
      )
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
