import Layout from "components/Shared/Layout";
import PrivateRoute from "components/Shared/PrivateRoute";
import "devextreme/dist/css/dx.common.css";
import "devextreme/dist/css/dx.material.blue.light.css";
import { UserRolesEnum } from "generated/graphql";
import {
  anonymousRoutes,
  bankRoutes,
  customerRoutes,
  routes,
} from "lib/routes";
import ReviewPurchaseOrderPage from "pages/Anonymous/ReviewPurchaseOrder";
import ReviewPurchaseOrderCompletePage from "pages/Anonymous/ReviewPurchaseOrderComplete";
import SecureLinkPage from "pages/Anonymous/SecureLink";
import BankAccounts from "pages/Bank/BankAccounts";
import Customer from "pages/Bank/Customer";
import Customers from "pages/Bank/Customers";
import CompanyProfilePage from "pages/Customer/CompanyProfile";
import LoansPage from "pages/Customer/Loans";
import PurchaseOrdersPage from "pages/Customer/PurchaseOrders";
import SettingsPage from "pages/Customer/Settings";
import Home from "pages/Home";
import SignIn from "pages/SignIn";
import UserProfile from "pages/UserProfile";
import Users from "pages/Users";
import Vendors from "pages/Vendors";
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
import { useLocation } from "react-use";

function App() {
  const { pathname } = useLocation();

  return (
    <BrowserRouter>
      <Switch>
        <Redirect from="/:url*(/+)" to={pathname?.slice(0, -1) || "/"} />
        <Route exact path={routes.signIn}>
          <SignIn></SignIn>
        </Route>
        <Route exact path={anonymousRoutes.secureLink}>
          <SecureLinkPage></SecureLinkPage>
        </Route>
        {/* Purchase Order reviewer routes */}
        <Route
          exact
          path={anonymousRoutes.reviewPurchaseOrder}
          component={ReviewPurchaseOrderPage}
        ></Route>
        <Route
          exact
          path={anonymousRoutes.reviewPurchaseOrderComplete}
          component={ReviewPurchaseOrderCompletePage}
        ></Route>
        <Layout>
          <PrivateRoute
            exact
            path={routes.root}
            requiredRoles={[
              UserRolesEnum.BankAdmin,
              UserRolesEnum.CompanyAdmin,
            ]}
          >
            <Home></Home>
          </PrivateRoute>
          <PrivateRoute
            exact
            path={routes.overview}
            requiredRoles={[
              UserRolesEnum.BankAdmin,
              UserRolesEnum.CompanyAdmin,
            ]}
          >
            <Home></Home>
          </PrivateRoute>
          <PrivateRoute
            exact
            path={routes.vendors}
            requiredRoles={[
              UserRolesEnum.BankAdmin,
              UserRolesEnum.CompanyAdmin,
            ]}
          >
            <Vendors></Vendors>
          </PrivateRoute>
          <PrivateRoute
            exact
            path={routes.profile}
            requiredRoles={[
              UserRolesEnum.BankAdmin,
              UserRolesEnum.CompanyAdmin,
            ]}
          >
            <CompanyProfilePage></CompanyProfilePage>
          </PrivateRoute>
          <PrivateRoute
            path={routes.userProfile}
            requiredRoles={[
              UserRolesEnum.BankAdmin,
              UserRolesEnum.CompanyAdmin,
            ]}
          >
            <UserProfile></UserProfile>
          </PrivateRoute>
          <PrivateRoute
            path={routes.users}
            requiredRoles={[
              UserRolesEnum.BankAdmin,
              UserRolesEnum.CompanyAdmin,
            ]}
          >
            <Users></Users>
          </PrivateRoute>
          {/* Customer Routes */}
          <PrivateRoute
            exact
            path={customerRoutes.loans}
            requiredRoles={[UserRolesEnum.CompanyAdmin]}
          >
            <LoansPage></LoansPage>
          </PrivateRoute>
          <PrivateRoute
            exact
            path={customerRoutes.purchaseOrders}
            requiredRoles={[UserRolesEnum.CompanyAdmin]}
          >
            <PurchaseOrdersPage></PurchaseOrdersPage>
          </PrivateRoute>
          <PrivateRoute
            exact
            path={customerRoutes.settings}
            requiredRoles={[UserRolesEnum.CompanyAdmin]}
          >
            <SettingsPage></SettingsPage>
          </PrivateRoute>
          {/* Bank Routes */}
          <PrivateRoute
            exact
            path={bankRoutes.customers}
            requiredRoles={[UserRolesEnum.BankAdmin]}
          >
            <Customers></Customers>
          </PrivateRoute>
          <PrivateRoute
            path={bankRoutes.customer.root}
            requiredRoles={[UserRolesEnum.BankAdmin]}
          >
            <Customer></Customer>
          </PrivateRoute>
          <PrivateRoute
            exact
            path={bankRoutes.bankAccounts}
            requiredRoles={[UserRolesEnum.BankAdmin]}
          >
            <BankAccounts></BankAccounts>
          </PrivateRoute>
        </Layout>
      </Switch>
    </BrowserRouter>
  );
}

export default App;
