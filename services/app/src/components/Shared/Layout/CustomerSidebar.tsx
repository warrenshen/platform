import { Box, Drawer } from "@material-ui/core";
import List from "@material-ui/core/List";
import { Theme, createStyles, makeStyles } from "@material-ui/core/styles";
import EnvironmentChip from "components/Shared/Chip/EnvironmentChip";
import BespokeFinancialLogo from "components/Shared/Images/BespokeFinancialLogo.png";
import { ReactComponent as AdvancesIcon } from "components/Shared/Layout/Icons/Advances.svg";
import { ReactComponent as ContractsIcon } from "components/Shared/Layout/Icons/Contracts.svg";
import { ReactComponent as CustomersIcon } from "components/Shared/Layout/Icons/Customers.svg";
import { ReactComponent as EbbaApplicationsIcon } from "components/Shared/Layout/Icons/EbbaApplications.svg";
import { ReactComponent as FinancingRequestsIcon } from "components/Shared/Layout/Icons/FinancingRequests.svg";
import { ReactComponent as InvoicesIcon } from "components/Shared/Layout/Icons/Invoices.svg";
import { ReactComponent as LoansIcon } from "components/Shared/Layout/Icons/Loans.svg";
import { ReactComponent as MetrcIcon } from "components/Shared/Layout/Icons/Metrc.svg";
import { ReactComponent as OverviewIcon } from "components/Shared/Layout/Icons/Overview.svg";
import { ReactComponent as RepaymentsIcon } from "components/Shared/Layout/Icons/Payments.svg";
import { ReactComponent as PayorsIcon } from "components/Shared/Layout/Icons/Payors.svg";
import { ReactComponent as PurchaseOrdersIcon } from "components/Shared/Layout/Icons/PurchaseOrders.svg";
import { ReactComponent as ReportsIcon } from "components/Shared/Layout/Icons/Reports.svg";
import { ReactComponent as SettingsIcon } from "components/Shared/Layout/Icons/Settings.svg";
import { ReactComponent as VendorsIcon } from "components/Shared/Layout/Icons/Vendors.svg";
import NestedListItem from "components/Shared/Layout/NestedListItem";
import SidebarItem from "components/Shared/Layout/SidebarItem";
import UserMenu from "components/Shared/User/UserMenu";
import {
  CurrentUserContext,
  isRoleBankUser,
} from "contexts/CurrentUserContext";
import {
  useGetCompanySettingsByCompanyIdForCustomerQuery,
  useGetEbbaApplicationsCountForBankSubscription,
  useGetLoansCountForBankSubscription,
  useGetOpenLoansByDebtFacilityStatusesSubscription,
  useGetPartnershipRequestsCountForBankSubscription,
  useGetPurchaseOrdersChangesRequestedCountForCustomerQuery,
  useGetRepaymentsCountForBankSubscription,
} from "generated/graphql";
import {
  FeatureFlagEnum,
  ProductTypeEnum,
  ReportingRequirementsCategoryEnum,
} from "lib/enum";
import { useGetMissingReportsInfo } from "lib/finance/reports/reports";
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

  width: calc(100% - 270px);
  background-color: #f6f5f3;
  overflow-y: scroll;
`;

const Footer = styled.div`
  display: flex;
  flex-direction: column;
`;

const DRAWER_WIDTH = 270;

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
  isBankMenu?: boolean;
  text: string;
  link?: string;
  iconNode?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  icon?: ReactNode;
  iconPath?: string;
  counter?: number;
  counterColor?: string;
  items?: NavItem[];
};

const getCustomerNavItems = (
  productType: ProductTypeEnum | null,
  financialCertificationsMissingCount: number,
  isLatestBorrowingBaseMissing: boolean,
  isMetrcBased: boolean,
  purchaseOrdersChangesRequestedCount: number
): NavItem[] => {
  return [
    {
      dataCy: "overview",
      iconNode: OverviewIcon,
      text: "Overview",
      link: customerRoutes.overview,
    },
    {
      dataCy: "purchase-orders-new",
      visible:
        !!productType &&
        [
          ProductTypeEnum.DispensaryFinancing,
          ProductTypeEnum.InventoryFinancing,
          ProductTypeEnum.PurchaseMoneyFinancing,
        ].includes(productType),
      iconNode: PurchaseOrdersIcon,
      text: "Purchase Orders",
      link: customerRoutes.purchaseOrdersNew,
      counterColor: "rgb(230, 126, 34)",
      counter: purchaseOrdersChangesRequestedCount,
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
      dataCy: "loans",
      visible: !!productType,
      iconNode: LoansIcon,
      text: "Loans",
      link: customerRoutes.loans,
    },
    {
      dataCy: "repayments",
      iconNode: RepaymentsIcon,
      text: "Repayments",
      link: customerRoutes.payments,
    },
    {
      dataCy: "borrowing-base",
      iconNode: EbbaApplicationsIcon,
      visible:
        !!productType && [ProductTypeEnum.LineOfCredit].includes(productType),
      text: "Borrowing Base",
      link: customerRoutes.borrowingBase,
      counterColor: "rgb(230, 126, 34)",
      counter: isLatestBorrowingBaseMissing ? 1 : 0,
    },
    {
      dataCy: "financial-certifications",
      iconNode: EbbaApplicationsIcon,
      visible: !!productType && !isMetrcBased,
      text: "Financial Certifications",
      link: customerRoutes.financialCertifications,
      counterColor:
        financialCertificationsMissingCount > 1
          ? "rgb(230, 126, 34)"
          : "rgb(241, 196, 15)",
      counter: financialCertificationsMissingCount,
    },
    {
      dataCy: "financing-requests",
      iconNode: FinancingRequestsIcon,
      visible: !!productType && productType === ProductTypeEnum.LineOfCredit,
      text: "Financing Requests",
      link: customerRoutes.financingRequests,
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
      dataCy: "reports",
      visible:
        !!productType &&
        [
          ProductTypeEnum.InventoryFinancing,
          ProductTypeEnum.InvoiceFinancing,
          ProductTypeEnum.PurchaseMoneyFinancing,
          ProductTypeEnum.DispensaryFinancing,
        ].includes(productType),
      iconNode: ReportsIcon,
      text: "Reports",
      link: customerRoutes.reports,
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
  partnershipRequestsCount: number,
  debtFacilityUpdateCount: number
): NavItem[] => {
  return [
    {
      dataCy: "overview",
      iconNode: OverviewIcon,
      text: "Overview",
      link: bankRoutes.overview,
      isBankMenu: true,
    },
    {
      dataCy: "financing-requests",
      iconNode: FinancingRequestsIcon,
      text: "Financing Requests",
      link: bankRoutes.financingRequests,
      counter: loansCount,
      isBankMenu: true,
    },
    {
      dataCy: "loans",
      iconNode: LoansIcon,
      text: "Loans",
      link: bankRoutes.loans,
      isBankMenu: true,
    },
    {
      dataCy: "advances",
      iconNode: AdvancesIcon,
      text: "Advances",
      link: bankRoutes.advances,
      counter: 0,
      isBankMenu: true,
    },
    {
      dataCy: "repayments",
      iconNode: RepaymentsIcon,
      text: "Repayments",
      link: bankRoutes.payments,
      counter: repaymentsCount,
      isBankMenu: true,
    },
    {
      dataCy: "purchase-orders-new",
      iconNode: PurchaseOrdersIcon,
      text: "Purchase Orders",
      link: bankRoutes.purchaseOrdersNew,
      isBankMenu: true,
    },
    {
      dataCy: "invoices",
      iconNode: InvoicesIcon,
      text: "Invoices",
      link: bankRoutes.invoices,
      isBankMenu: true,
    },
    {
      dataCy: "client-surveillance",
      iconNode: EbbaApplicationsIcon,
      text: "Client Surveillance",
      link: bankRoutes.ebbaApplications,
      counter: ebbaApplicationsCount,
      isBankMenu: true,
    },
    {
      dataCy: "debt-facility",
      iconNode: LoansIcon,
      text: "Debt Facility",
      link: bankRoutes.debtFacility,
      counter: debtFacilityUpdateCount,
      isBankMenu: true,
    },
    {
      dataCy: "companies",
      iconNode: CustomersIcon,
      text: "Companies",
      link: bankRoutes.companies,
      isBankMenu: true,
    },
    {
      dataCy: "vendors",
      iconNode: VendorsIcon,
      text: "Vendors",
      link: bankRoutes.vendors,
      isBankMenu: true,
    },
    {
      dataCy: "payors",
      iconNode: PayorsIcon,
      text: "Payors",
      link: bankRoutes.payors,
      isBankMenu: true,
    },
    {
      dataCy: "partnerships",
      iconNode: PayorsIcon,
      text: "Partnerships",
      link: bankRoutes.partnerships,
      counter: partnershipRequestsCount,
      isBankMenu: true,
    },
    {
      dataCy: "reports",
      iconNode: ReportsIcon,
      text: "Reports",
      link: bankRoutes.reports,
      isBankMenu: true,
    },
    {
      dataCy: "metrc",
      iconNode: MetrcIcon,
      text: "Metrc",
      link: bankRoutes.metrcRoot,
      isBankMenu: true,
    },
    {
      dataCy: "settings",
      iconNode: SettingsIcon,
      text: "Settings",
      link: bankRoutes.settings,
      isBankMenu: true,
    },
  ];
};

interface Props {
  isLocationsPage?: boolean;
  appBarTitle: string;
  children: ReactNode;
}

export default function Layout({
  isLocationsPage = false,
  appBarTitle,
  children,
}: Props) {
  useTitle(`${appBarTitle} | Bespoke`);

  const classes = useStyles();
  const location = useLocation();

  const {
    user: { role, productType, companyId, isEmbeddedModule },
  } = useContext(CurrentUserContext);
  const isBankUser = isRoleBankUser(role);

  const { data: loansCountData } = useGetLoansCountForBankSubscription({
    skip: !isBankUser,
  });

  const { data: repaymentsCountData } =
    useGetRepaymentsCountForBankSubscription({
      skip: !isBankUser,
    });

  const { data: partnershipRequestsCountData } =
    useGetPartnershipRequestsCountForBankSubscription({
      skip: !isBankUser,
    });

  const { data: ebbaApplicationsCountData } =
    useGetEbbaApplicationsCountForBankSubscription({
      skip: !isBankUser,
    });

  const { data: debtFacilityUpdateCountData } =
    useGetOpenLoansByDebtFacilityStatusesSubscription({
      skip: !isBankUser,
      variables: {
        statuses: ["update_required"],
      },
    });

  const { data: purchaseOrdersChangesRequestedCountData } =
    useGetPurchaseOrdersChangesRequestedCountForCustomerQuery({
      skip: !companyId,
      variables: {
        company_id: companyId,
      },
    });

  const loansCount = loansCountData?.loans?.length || 0;
  const repaymentsCount = repaymentsCountData?.payments?.length || 0;
  const ebbaApplicationsCount =
    ebbaApplicationsCountData?.ebba_applications?.length || 0;
  const partnershipRequestsCount =
    partnershipRequestsCountData?.company_partnership_requests?.length || 0;
  const debtFacilityUpdateCount =
    debtFacilityUpdateCountData?.loans?.length || 0;
  const purchaseOrdersChangesRequestedCount =
    purchaseOrdersChangesRequestedCountData?.purchase_orders?.length || 0;

  const { missingFinancialReportCount, isLatestBorrowingBaseMissing } =
    useGetMissingReportsInfo(companyId);

  const { data: companySettingsData } =
    useGetCompanySettingsByCompanyIdForCustomerQuery({
      skip: isBankUser,
      variables: {
        company_id: companyId,
      },
    });

  const featureFlags =
    companySettingsData?.company_settings?.[0]?.feature_flags_payload || {};
  const isMetrcBased =
    !!featureFlags &&
    featureFlags.hasOwnProperty(FeatureFlagEnum.ReportingRequirementsCategory)
      ? featureFlags[FeatureFlagEnum.ReportingRequirementsCategory] ===
        ReportingRequirementsCategoryEnum.Four
      : false;

  const navItems = isBankUser
    ? getBankNavItems(
        loansCount,
        repaymentsCount,
        ebbaApplicationsCount,
        partnershipRequestsCount,
        debtFacilityUpdateCount
      )
    : getCustomerNavItems(
        productType,
        missingFinancialReportCount,
        isLatestBorrowingBaseMissing,
        isMetrcBased,
        purchaseOrdersChangesRequestedCount
      );

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
        {!isEmbeddedModule && (
          <Logo href={routes.root}>
            <img
              src={BespokeFinancialLogo}
              alt="Bespoke Financial Logo"
              width={156}
              height={32}
            />
          </Logo>
        )}
        <SidebarItems>
          {!isLocationsPage && (
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
                      isBankMenu={!!item.isBankMenu}
                      chipCount={item.counter}
                      chipColor={item.counterColor}
                      IconNode={item.iconNode || null}
                      label={item.text}
                      to={item.link}
                    />
                  ) : (
                    <NestedListItem key={item.text + index} item={item} />
                  )
                )}
            </List>
          )}
        </SidebarItems>
        <Footer>
          <Box>
            <EnvironmentChip />
          </Box>
          <Box>
            <UserMenu isLocationsPage={isLocationsPage} />
          </Box>
        </Footer>
      </Drawer>
      <Content>{children}</Content>
    </Wrapper>
  );
}
