import { Box, Paper, Tab, Tabs } from "@material-ui/core";
import Loans from "components/Bank/Customer/Loans";
import Overview from "components/Bank/Customer/Overview";
import Profile from "components/Bank/Customer/Profile";
import PurchaseOrders from "components/Bank/Customer/PurchaseOrders";
import Settings from "components/Bank/Customer/Settings";
import Users from "components/Bank/Customer/Users";
import Vendors from "components/Bank/Customer/Vendors";
import PrivateRoute from "components/Shared/PrivateRoute";
import { useBankCustomerQuery, UserRolesEnum } from "generated/graphql";
import useAppBarTitle from "hooks/useAppBarTitle";
import { bankRoutes } from "lib/routes";
import { findIndex } from "lodash";
import { ChangeEvent, useEffect, useState } from "react";
import { Link, useLocation, useParams, useRouteMatch } from "react-router-dom";

export interface CustomerParams {
  companyId: string;
}

const customerPaths = [
  {
    path: bankRoutes.customer.overview,
    component: Overview,
    label: "Overview",
  },
  {
    path: bankRoutes.customer.loans,
    component: Loans,
    label: "Loans",
  },
  {
    path: bankRoutes.customer.purchaseOrders,
    component: PurchaseOrders,
    label: "Purchase Orders",
  },
  {
    path: bankRoutes.customer.vendors,
    component: Vendors,
    label: "Vendors",
  },
  {
    path: bankRoutes.customer.users,
    component: Users,
    label: "Users",
  },
  {
    path: bankRoutes.customer.profile,
    component: Profile,
    label: "Profile",
  },
  {
    path: bankRoutes.customer.settings,
    component: Settings,
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

  const setAppBarTitle = useAppBarTitle();
  const customerName = data?.companies_by_pk?.name;

  useEffect(() => {
    setAppBarTitle(customerName);
  }, [setAppBarTitle, customerName]);

  return (
    <>
      <Paper>
        <Tabs
          value={tabIndex === null || tabIndex < 0 ? 0 : tabIndex}
          onChange={(event: ChangeEvent<{}>, newValue: number) => {
            setTabIndex(newValue);
          }}
          indicatorColor="primary"
          centered
        >
          {customerPaths.map((customerPath, index) => {
            return (
              <Tab
                key={index}
                label={customerPath.label}
                component={Link}
                to={`${url}${customerPath.path}`}
              ></Tab>
            );
          })}
        </Tabs>
      </Paper>
      <Box pt={2}>
        <PrivateRoute
          exact
          path={path}
          requiredRoles={[UserRolesEnum.BankAdmin]}
        >
          <Overview></Overview>
        </PrivateRoute>
        {customerPaths.map((customerPath, index) => {
          return (
            <PrivateRoute
              key={index}
              path={`${path}${customerPath.path}`}
              requiredRoles={[UserRolesEnum.BankAdmin]}
            >
              {customerPath.component()}
            </PrivateRoute>
          );
        })}
      </Box>
    </>
  );
}

export default BankCustomerPage;
