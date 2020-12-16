import { Box, Paper, Tab, Tabs } from "@material-ui/core";
import Loans from "components/Bank/Customer/Loans";
import Overview from "components/Bank/Customer/Overview";
import Profile from "components/Bank/Customer/Profile";
import PurchaseOrders from "components/Bank/Customer/PurchaseOrders";
import Users from "components/Bank/Customer/Users";
import Vendors from "components/Vendors/Bank";
import {
  Link,
  Route,
  RouteProps,
  useParams,
  useRouteMatch,
} from "react-router-dom";
import { bankPaths } from "routes";

function Customer(props: RouteProps) {
  const { customerId } = useParams<{ customerId: string }>();
  const { url, path } = useRouteMatch();

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

  return (
    <>
      <Paper>
        <Tabs>
          {customerPaths.map((customerPath, index) => {
            return (
              <Tab
                key={index}
                value={index}
                label={customerPath.label}
                component={Link}
                to={`${url}${customerPath.path}`}
              ></Tab>
            );
          })}
        </Tabs>
      </Paper>
      <Box>
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
