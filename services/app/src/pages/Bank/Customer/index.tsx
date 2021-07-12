import { Box, ListItem, ListItemText } from "@material-ui/core";
import List from "@material-ui/core/List";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Page from "components/Shared/Page";
import PrivateRoute from "components/Shared/PrivateRoute";
import {
  Companies,
  ProductTypeEnum,
  useGetCustomerForBankQuery,
  UserRolesEnum,
} from "generated/graphql";
import { bankRoutes } from "lib/routes";
import { isPayorsTabVisible, isVendorsTabVisible } from "lib/settings";
import BankCustomerContractPage from "pages/Bank/Customer/Contract";
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
import BankCustomerOverviewSubpage from "./Overview";
import BankCustomerPaymentsSubpage from "./Repayments";
import BankCustomerPayorsSubpage from "./Payors";
import BankCustomerPurchaseOrdersSubpage from "./PurchaseOrders";
import BankCustomerSettingsSubpage from "./Settings";
import BankCustomerVendorsSubpage from "./Vendors";
import BankCustomerMetrcSubpage from "./Metrc";

const DRAWER_WIDTH = 200;

const TitleText = styled.span`
  margin-bottom: 24px;
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

const getCustomerPaths = (productType: ProductTypeEnum | null) => [
  {
    path: bankRoutes.company.overview,
    component: BankCustomerOverviewSubpage,
    label: "Overview",
  },
  {
    path: bankRoutes.company.loans,
    component: BankCustomerLoansSubpage,
    label: "Loans",
  },
  {
    visible:
      !!productType &&
      [
        ProductTypeEnum.InventoryFinancing,
        ProductTypeEnum.PurchaseMoneyFinancing,
      ].includes(productType),
    path: bankRoutes.company.purchaseOrders,
    component: BankCustomerPurchaseOrdersSubpage,
    label: "Purchase Orders",
  },
  {
    visible:
      !!productType && [ProductTypeEnum.LineOfCredit].includes(productType),
    path: bankRoutes.company.ebbaApplications,
    component: BankCustomerEbbaApplicationsSubpage,
    label: "Borrowing Base",
  },
  {
    visible:
      !!productType &&
      [
        ProductTypeEnum.InvoiceFinancing,
        ProductTypeEnum.PurchaseMoneyFinancing,
      ].includes(productType),
    path: bankRoutes.company.invoices,
    component: BankCustomerInvoicesSubpage,
    label: "Invoices",
  },
  {
    path: bankRoutes.company.payments,
    component: BankCustomerPaymentsSubpage,
    label: "Repayments",
  },
  {
    visible: isVendorsTabVisible(productType),
    path: bankRoutes.company.vendors,
    component: BankCustomerVendorsSubpage,
    label: "Vendors",
  },
  {
    visible: isPayorsTabVisible(productType),
    path: bankRoutes.company.payors,
    component: BankCustomerPayorsSubpage,
    label: "Payors",
  },
  {
    path: bankRoutes.company.metrc,
    component: BankCustomerMetrcSubpage,
    label: "Metrc",
  },
  {
    path: bankRoutes.company.contract,
    component: BankCustomerContractPage,
    label: "Contract",
  },
  {
    path: bankRoutes.company.settings,
    component: BankCustomerSettingsSubpage,
    label: "Settings",
  },
  {
    visible: false,
    path: bankRoutes.company.accountFeesCredits,
    component: BankCustomerAccountFeesCreditsSubpage,
  },
];

export default function BankCustomerPage() {
  const { companyId } = useParams<{
    companyId: Companies["id"];
  }>();
  const { url, path } = useRouteMatch();
  const location = useLocation();
  const classes = useStyles();

  const { data } = useGetCustomerForBankQuery({
    variables: {
      id: companyId,
    },
  });

  const customer = data?.companies_by_pk;
  const customerName = customer?.name;
  const productType = customer?.contract?.product_type || null;

  return (
    <Page appBarTitle={customerName || ""}>
      <Box display="flex" width="100%">
        <Box className={classes.drawer}>
          <TitleText>{customerName || ""}</TitleText>
          <List className={classes.list}>
            {getCustomerPaths(productType)
              .filter((customerPath) => customerPath.visible !== false)
              .map((customerPath) => (
                <ListItem
                  key={customerPath.path}
                  button
                  component={Link}
                  to={`${url}${customerPath.path}`}
                  selected={Boolean(
                    matchPath(
                      location.pathname,
                      `/companies/:companyId${customerPath.path}`
                    )
                  )}
                >
                  <ListItemText
                    primaryTypographyProps={{
                      className: classes.listItemText,
                      variant: "subtitle1",
                    }}
                  >
                    {customerPath.label}
                  </ListItemText>
                </ListItem>
              ))}
          </List>
        </Box>
        <Box className={classes.content}>
          {getCustomerPaths(productType).map((customerPath) => (
            <PrivateRoute
              key={customerPath.path}
              exact
              path={`${path}${customerPath.path}`}
              requiredRoles={[
                UserRolesEnum.BankAdmin,
                UserRolesEnum.BankReadOnly,
              ]}
            >
              {customerPath.component({ companyId, productType })}
            </PrivateRoute>
          ))}
        </Box>
      </Box>
    </Page>
  );
}
