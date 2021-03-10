import { Box, ListItem, ListItemText } from "@material-ui/core";
import List from "@material-ui/core/List";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Page from "components/Shared/Page";
import PrivateRoute from "components/Shared/PrivateRoute";
import {
  ProductTypeEnum,
  useGetCustomerForBankQuery,
  UserRolesEnum,
} from "generated/graphql";
import { bankRoutes } from "lib/routes";
import BankCustomerContractPage from "pages/Bank/Customer/Contract";
import {
  Link,
  matchPath,
  useLocation,
  useParams,
  useRouteMatch,
} from "react-router-dom";
import BankCustomerEbbaApplicationsSubpage from "./EbbaApplications";
import BankCustomerLoansSubpage from "./Loans";
import BankCustomerOverviewSubpage from "./Overview";
import BankCustomerPurchaseOrdersSubpage from "./PurchaseOrders";
import BankCustomerSettingsSubpage from "./Settings";
import BankCustomerUsersSubpage from "./Users";
import BankCustomerVendorsSubpage from "./Vendors";

const DRAWER_WIDTH = 175;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    drawer: {
      display: "flex",
      flexDirection: "column",
      width: DRAWER_WIDTH,
    },
    content: {
      display: "flex",
      flexDirection: "column",
      backgroundColor: theme.palette.background.default,
      width: `calc(100% - ${DRAWER_WIDTH}px)`,
      paddingLeft: theme.spacing(3),
    },
    list: {
      padding: 0,
    },
    listItemText: {
      fontWeight: 500,
    },
  })
);

export interface CustomerParams {
  companyId: string;
}

const getCustomerPaths = (productType: ProductTypeEnum) => [
  {
    path: bankRoutes.customer.overview,
    component: BankCustomerOverviewSubpage,
    label: "Overview",
  },
  {
    path: bankRoutes.customer.loans,
    component: BankCustomerLoansSubpage,
    label: "Loans",
  },
  {
    visible: productType === ProductTypeEnum.InventoryFinancing,
    path: bankRoutes.customer.purchaseOrders,
    component: BankCustomerPurchaseOrdersSubpage,
    label: "Purchase Orders",
  },
  {
    visible: productType === ProductTypeEnum.LineOfCredit,
    path: bankRoutes.customer.ebbaApplications,
    component: BankCustomerEbbaApplicationsSubpage,
    label: "Borrowing Base",
  },
  {
    path: bankRoutes.customer.vendors,
    component: BankCustomerVendorsSubpage,
    label: "Vendors",
  },
  {
    path: bankRoutes.customer.contract,
    component: BankCustomerContractPage,
    label: "Contract",
  },
  {
    path: bankRoutes.customer.users,
    component: BankCustomerUsersSubpage,
    label: "Users",
  },
  {
    path: bankRoutes.customer.settings,
    component: BankCustomerSettingsSubpage,
    label: "Settings",
  },
];

function BankCustomerPage() {
  const { companyId } = useParams<CustomerParams>();
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
  const productType = customer?.contract?.product_type || ProductTypeEnum.None;

  return (
    <Page appBarTitle={customerName || ""}>
      <Box display="flex" width="100%">
        <Box className={classes.drawer}>
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
                      `/customers/:companyId${customerPath.path}`
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
              path={`${path}${customerPath.path}`}
              requiredRoles={[UserRolesEnum.BankAdmin]}
            >
              {customerPath.component({ companyId, productType })}
            </PrivateRoute>
          ))}
        </Box>
      </Box>
    </Page>
  );
}

export default BankCustomerPage;
