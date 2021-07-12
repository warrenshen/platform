import { Box, ListItem, ListItemText, Typography } from "@material-ui/core";
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
import BankCustomerSettingsSubpage from "./Settings";
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
  label: string;
  path: string;
  component: NonNullable<
    React.FunctionComponent<{
      companyId: Companies["id"];
      productType: ProductTypeEnum | null;
    }>
  >;
};

const getCustomerPaths = (productType: ProductTypeEnum | null) => [
  {
    label: "Customer",
    paths: [
      {
        label: "Overview",
        path: bankRoutes.company.overview,
        component: BankCustomerOverviewSubpage,
      },
      {
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
        label: "Purchase Orders",
        path: bankRoutes.company.purchaseOrders,
        component: BankCustomerPurchaseOrdersSubpage,
      },
      {
        visible:
          !!productType && [ProductTypeEnum.LineOfCredit].includes(productType),
        label: "Borrowing Base",
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
        label: "Invoices",
        path: bankRoutes.company.invoices,
        component: BankCustomerInvoicesSubpage,
      },
      {
        label: "Repayments",
        path: bankRoutes.company.payments,
        component: BankCustomerPaymentsSubpage,
      },
      {
        visible: isVendorsTabVisible(productType),
        label: "Vendors",
        path: bankRoutes.company.vendors,
        component: BankCustomerVendorsSubpage,
      },
      {
        visible: isPayorsTabVisible(productType),
        label: "Payors",
        path: bankRoutes.company.payors,
        component: BankCustomerPayorsSubpage,
      },
      {
        label: "Metrc",
        path: bankRoutes.company.metrc,
        component: BankCustomerMetrcSubpage,
      },
      {
        label: "Contract",
        path: bankRoutes.company.contract,
        component: BankCustomerContractPage,
      },
      {
        visible: false,
        label: "Account Fees & Credits",
        path: bankRoutes.company.accountFeesCredits,
        component: BankCustomerAccountFeesCreditsSubpage,
      },
    ] as BankCustomerPath[],
  },
  // {
  //   label: "Vendor",
  //   paths: [
  //     {
  //       path: bankRoutes.company.settings,
  //       component: BankCustomerSettingsSubpage,
  //       label: "Settings",
  //     },
  //   ]
  // },
  {
    label: "General",
    paths: [
      {
        label: "Settings",
        path: bankRoutes.company.settings,
        component: BankCustomerSettingsSubpage,
      },
    ] as BankCustomerPath[],
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
            {getCustomerPaths(productType).map((section) => (
              <Box display="flex" flexDirection="column" mt={2}>
                <Box mb={1}>
                  <Typography variant="subtitle2" color="textSecondary">
                    <b>{section.label.toUpperCase()}</b>
                  </Typography>
                </Box>
                <List>
                  {section.paths
                    .filter(
                      (customerPath) =>
                        customerPath.visible == null || !!customerPath?.visible
                    )
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
            ))}
          </List>
        </Box>
        <Box className={classes.content}>
          {flatten(
            getCustomerPaths(productType).map((section) => section.paths)
          ).map((customerPath) => (
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
