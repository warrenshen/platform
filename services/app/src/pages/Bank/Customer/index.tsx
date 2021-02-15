import { Box, Paper, Tab, Tabs } from "@material-ui/core";
import Page from "components/Shared/Page";
import PrivateRoute from "components/Shared/PrivateRoute";
import { useBankCustomerQuery, UserRolesEnum } from "generated/graphql";
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

const customerPaths = [
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

  useEffect(() => {
    const index = findIndex(customerPaths, ({ path }) => {
      return location.pathname.replace(url, "") === path;
    });
    setTabIndex(index);
  }, [location.pathname, url]);

  const { data } = useBankCustomerQuery({
    variables: {
      id: companyId,
    },
  });

  const customerName = data?.companies_by_pk?.name;

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
          {customerPaths.map((customerPath, index) => (
            <Tab
              key={index}
              label={customerPath.label}
              component={Link}
              to={`${url}${customerPath.path}`}
            ></Tab>
          ))}
        </Tabs>
      </Paper>
      <Box pt={2}>
        <PrivateRoute
          exact
          path={path}
          requiredRoles={[UserRolesEnum.BankAdmin]}
        >
          <BankCustomerOverviewSubpage></BankCustomerOverviewSubpage>
        </PrivateRoute>
        {customerPaths.map((customerPath, index) => {
          return (
            <PrivateRoute
              key={index}
              path={`${path}${customerPath.path}`}
              requiredRoles={[UserRolesEnum.BankAdmin]}
            >
              {customerPath.component({ companyId })}
            </PrivateRoute>
          );
        })}
      </Box>
    </Page>
  );
}

export default BankCustomerPage;
