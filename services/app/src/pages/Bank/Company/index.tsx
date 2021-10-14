import { Box, ListItem, ListItemText, Typography } from "@material-ui/core";
import List from "@material-ui/core/List";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Page from "components/Shared/Page";
import PrivateRoute from "components/Shared/PrivateRoute";
import {
  Companies,
  GetCompanyForBankCompanyPageQuery,
  ProductTypeEnum,
  useGetCompanyForBankCompanyPageQuery,
  UserRolesEnum,
} from "generated/graphql";
import { bankRoutes } from "lib/routes";
import { isPayorsTabVisible, isVendorsTabVisible } from "lib/settings";
import BankCustomerContractPage from "pages/Bank/Company/Contract";
import { flatten } from "lodash";
import {
  Link,
  matchPath,
  useLocation,
  useParams,
  useRouteMatch,
} from "react-router-dom";
import styled from "styled-components";
import BankCustomerAccountFeesCreditsSubpage from "./AccountFeesCredits";
import BankCustomerEbbaApplicationsSubpage from "./EbbaApplications";
import BankCustomerInvoicesSubpage from "./Invoices";
import BankCustomerLoansSubpage from "./Loans";
import BankCustomerMetrcSubpage from "./Metrc";
import BankCustomerOverviewSubpage from "./Overview";
import BankCustomerPayorsSubpage from "./Payors";
import BankCustomerPurchaseOrdersSubpage from "./PurchaseOrders";
import BankCustomerPaymentsSubpage from "./Repayments";
import BankCompanyPayorPartnershipsSubpage from "./PayorPartnerships";
import BankCustomerSettingsSubpage from "./Settings";
import BankCompanyVendorPartnershipsSubpage from "./VendorPartnerships";
import BankCustomerVendorsSubpage from "./Vendors";

const DRAWER_WIDTH = 200;

const TitleText = styled.span`
  font-size: 24px;
  font-weight: 500;
`;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    drawer: {
      display: "flex",
      flexDirection: "column",

      width: DRAWER_WIDTH,
      height: "100%",
      paddingTop: 64,
      marginLeft: 32,
    },
    content: {
      display: "flex",
      flexDirection: "column",

      width: `calc(100% - ${DRAWER_WIDTH}px)`,
      height: "100%",
    },
    list: {
      padding: 0,
    },
    listItemText: {
      fontWeight: 500,
    },
  })
);

type BankCustomerPath = {
  visible?: boolean;
  dataCy: string;
  label: string;
  path: string;
  component: NonNullable<
    React.FunctionComponent<{
      companyId: Companies["id"];
      productType: ProductTypeEnum | null;
    }>
  >;
};

const getCustomerPaths = (
  company: GetCompanyForBankCompanyPageQuery["companies_by_pk"] | null,
  productType: ProductTypeEnum | null
) => [
  {
    visible: !!company?.is_customer,
    label: "Customer",
    paths: [
      {
        dataCy: "customer-overview",
        label: "Overview",
        path: bankRoutes.company.overview,
        component: BankCustomerOverviewSubpage,
      },
      {
        dataCy: "customer-loans",
        label: "Loans",
        path: bankRoutes.company.loans,
        component: BankCustomerLoansSubpage,
      },
      {
        visible:
          !!productType &&
          [
            ProductTypeEnum.InventoryFinancing,
            ProductTypeEnum.PurchaseMoneyFinancing,
          ].includes(productType),
        dataCy: "customer-purchase-orders",
        label: "Purchase Orders",
        path: bankRoutes.company.purchaseOrders,
        component: BankCustomerPurchaseOrdersSubpage,
      },
      {
        dataCy: "customer-financials",
        label:
          !!productType && [ProductTypeEnum.LineOfCredit].includes(productType)
            ? "Borrowing Base"
            : "Financial Certifications",
        path: bankRoutes.company.ebbaApplications,
        component: BankCustomerEbbaApplicationsSubpage,
      },
      {
        visible:
          !!productType &&
          [
            ProductTypeEnum.InvoiceFinancing,
            ProductTypeEnum.PurchaseMoneyFinancing,
          ].includes(productType),
        dataCy: "customer-invoices",
        label: "Invoices",
        path: bankRoutes.company.invoices,
        component: BankCustomerInvoicesSubpage,
      },
      {
        dataCy: "customer-repayments",
        label: "Repayments",
        path: bankRoutes.company.payments,
        component: BankCustomerPaymentsSubpage,
      },
      {
        visible: isVendorsTabVisible(productType),
        dataCy: "customer-vendors",
        label: "Vendors",
        path: bankRoutes.company.vendors,
        component: BankCustomerVendorsSubpage,
      },
      {
        visible: isPayorsTabVisible(productType),
        dataCy: "customer-payors",
        label: "Payors",
        path: bankRoutes.company.payors,
        component: BankCustomerPayorsSubpage,
      },
      {
        dataCy: "customer-contract",
        label: "Contract",
        path: bankRoutes.company.contract,
        component: BankCustomerContractPage,
      },
      {
        visible: false,
        dataCy: "customer-account-fees-credits",
        label: "Account Fees & Credits",
        path: bankRoutes.company.accountFeesCredits,
        component: BankCustomerAccountFeesCreditsSubpage,
      },
    ] as BankCustomerPath[],
  },
  {
    visible: !!company?.is_payor,
    label: "Payor",
    paths: [
      {
        dataCy: "payor-partnerships",
        label: "Partnerships",
        path: bankRoutes.company.payorPartnerships,
        component: BankCompanyPayorPartnershipsSubpage,
      },
    ] as BankCustomerPath[],
  },
  {
    visible: !!company?.is_vendor,
    label: "Vendor",
    paths: [
      {
        dataCy: "vendor-partnerships",
        label: "Partnerships",
        path: bankRoutes.company.vendorPartnerships,
        component: BankCompanyVendorPartnershipsSubpage,
      },
    ] as BankCustomerPath[],
  },
  {
    visible: true,
    label: "General",
    paths: [
      {
        dataCy: "general-metrc",
        label: "Metrc",
        path: bankRoutes.company.metrc,
        component: BankCustomerMetrcSubpage,
      },
      {
        dataCy: "general-settings",
        label: "Settings",
        path: bankRoutes.company.settings,
        component: BankCustomerSettingsSubpage,
      },
    ] as BankCustomerPath[],
  },
];

export default function BankCompanyPage() {
  const { companyId } = useParams<{
    companyId: Companies["id"];
  }>();
  const { url, path } = useRouteMatch();
  const location = useLocation();
  const classes = useStyles();

  const { data } = useGetCompanyForBankCompanyPageQuery({
    variables: {
      id: companyId,
    },
  });

  const company = data?.companies_by_pk || null;
  const companyName = company?.name;
  const productType = company?.contract?.product_type || null;

  return (
    <Page appBarTitle={companyName || ""}>
      <Box display="flex" width="100%">
        <Box className={classes.drawer}>
          <TitleText>{companyName || ""}</TitleText>
          <List className={classes.list}>
            {getCustomerPaths(company, productType)
              .filter(
                (section) => section.visible == null || !!section?.visible
              )
              .map((section) => (
                <Box
                  key={section.label}
                  display="flex"
                  flexDirection="column"
                  mt={2}
                >
                  <Box mb={1}>
                    <Typography variant="subtitle2" color="textSecondary">
                      <b>{section.label.toUpperCase()}</b>
                    </Typography>
                  </Box>
                  <List>
                    {section.paths
                      .filter(
                        (companyPath) =>
                          companyPath.visible == null || !!companyPath?.visible
                      )
                      .map((companyPath) => (
                        <ListItem
                          key={companyPath.path}
                          data-cy={`company-sidebar-item-${companyPath.dataCy}`}
                          button
                          component={Link}
                          to={`${url}${companyPath.path}`}
                          selected={Boolean(
                            matchPath(
                              location.pathname,
                              `/companies/:companyId${companyPath.path}`
                            )
                          )}
                        >
                          <ListItemText
                            primaryTypographyProps={{
                              className: classes.listItemText,
                              variant: "subtitle1",
                            }}
                          >
                            {companyPath.label}
                          </ListItemText>
                        </ListItem>
                      ))}
                  </List>
                </Box>
              ))}
          </List>
        </Box>
        <Box className={classes.content}>
          {flatten(
            getCustomerPaths(company, productType).map(
              (section) => section.paths
            )
          ).map((companyPath) => (
            <PrivateRoute
              key={companyPath.path}
              exact
              path={`${path}${companyPath.path}`}
              requiredRoles={[
                UserRolesEnum.BankAdmin,
                UserRolesEnum.BankReadOnly,
              ]}
            >
              {companyPath.component({ companyId, productType })}
            </PrivateRoute>
          ))}
        </Box>
      </Box>
    </Page>
  );
}
