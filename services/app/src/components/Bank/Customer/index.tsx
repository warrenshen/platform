import { Box, Paper, Tab, Tabs } from "@material-ui/core";
import Loans from "components/Bank/Customer/Loans";
import Overview from "components/Bank/Customer/Overview";
import Profile from "components/Bank/Customer/Profile";
import PurchaseOrders from "components/Bank/Customer/PurchaseOrders";
import Users from "components/Bank/Customer/Users";
import Vendors from "components/Bank/Customer/Vendors";
import { useBankCustomerQuery } from "generated/graphql";
import useAppBarTitle from "hooks/useAppBarTitle";
import { findIndex } from "lodash";
import { ChangeEvent, useEffect, useState } from "react";
import {
  Link,
  Route,
  useLocation,
  useParams,
  useRouteMatch,
} from "react-router-dom";
import { bankPaths } from "routes";

export interface CustomerParams {
  customerId: string;
}

const customerPaths = [
  {
    path: bankPaths.customer.overview,
    component: Overview,
    label: "Overview",
  },
  {
    path: bankPaths.customer.loans,
    component: Loans,
    label: "Loans",
  },
  {
    path: bankPaths.customer.purchaseOrders,
    component: PurchaseOrders,
    label: "Purchase Orders",
  },
  {
    path: bankPaths.customer.vendors,
    component: Vendors,
    label: "Vendors",
  },
  {
    path: bankPaths.customer.users,
    component: Users,
    label: "Users",
  },
  {
    path: bankPaths.customer.profile,
    component: Profile,
    label: "Profile",
  },
];

function Customer() {
  const { customerId } = useParams<CustomerParams>();
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
      id: customerId,
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
          value={tabIndex === null ? undefined : tabIndex}
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
        <Route exact path={path} component={Overview} />
        {customerPaths.map((customerPath, index) => {
          return (
            <Route
              key={index}
              path={`${path}${customerPath.path}`}
              component={customerPath.component}
            />
          );
        })}
      </Box>
    </>
  );
}

export default Customer;
