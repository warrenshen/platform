import { Box, Paper, Tab, Tabs } from "@material-ui/core";
import Page from "components/Shared/Page";
import PrivateRoute from "components/Shared/PrivateRoute";
import {
  ProductTypeEnum,
  useGetCustomerForBankQuery,
  UserRolesEnum,
} from "generated/graphql";
import { bankRoutes } from "lib/routes";
import { findIndex } from "lodash";
import { ChangeEvent, useEffect, useState } from "react";
import { Link, useLocation, useParams, useRouteMatch } from "react-router-dom";
import BankCustomerCompanyProfileSubpage from "./CompanyProfile";
import BankCustomerLoansSubpage from "./Loans";
import BankCustomerOverviewSubpage from "./Overview";
import BankCustomerPurchaseOrdersSubpage from "./PurchaseOrders";
import BankCustomerSettingsSubpage from "./Settings";
import BankCustomerUsersSubpage from "./Users";
import BankCustomerVendorsSubpage from "./Vendors";

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
    label: productType === ProductTypeEnum.LineOfCredit ? "Drawdowns" : "Loans",
  },
  {
    visible: productType === ProductTypeEnum.InventoryFinancing,
    path: bankRoutes.customer.purchaseOrders,
    component: BankCustomerPurchaseOrdersSubpage,
    label: "Purchase Orders",
  },
  {
    path: bankRoutes.customer.vendors,
    component: BankCustomerVendorsSubpage,
    label: "Vendors",
  },
  {
    path: bankRoutes.customer.users,
    component: BankCustomerUsersSubpage,
    label: "Users",
  },
  {
    path: bankRoutes.customer.companyProfile,
    component: BankCustomerCompanyProfileSubpage,
    label: "Company Profile",
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
  const [tabIndex, setTabIndex] = useState<number | null>(null);

  const { data } = useGetCustomerForBankQuery({
    variables: {
      id: companyId,
    },
  });

  const customer = data?.companies_by_pk;
  const customerName = customer?.name;
  const productType = customer?.contract?.product_type || ProductTypeEnum.None;

  useEffect(() => {
    const index = findIndex(getCustomerPaths(productType), ({ path }) => {
      return location.pathname.replace(url, "") === path;
    });
    setTabIndex(index);
  }, [productType, location.pathname, url]);

  return (
    <Page appBarTitle={customerName || ""}>
      <Paper>
        <Tabs
          indicatorColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          value={tabIndex === null || tabIndex < 0 ? 0 : tabIndex}
          onChange={(event: ChangeEvent<{}>, newValue: number) => {
            setTabIndex(newValue);
          }}
        >
          {getCustomerPaths(productType)
            .filter((customerPath) => customerPath.visible !== false)
            .map((customerPath) => (
              <Tab
                key={customerPath.path}
                label={customerPath.label}
                component={Link}
                to={`${url}${customerPath.path}`}
              />
            ))}
        </Tabs>
      </Paper>
      <Box pt={2}>
        <PrivateRoute
          exact
          path={path}
          requiredRoles={[UserRolesEnum.BankAdmin]}
        >
          <BankCustomerOverviewSubpage />
        </PrivateRoute>
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
    </Page>
  );
}

export default BankCustomerPage;
