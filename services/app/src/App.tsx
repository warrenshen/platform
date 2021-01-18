import Layout from "components/Shared/Layout";
import PrivateRoute from "components/Shared/PrivateRoute";
import { UserRole } from "contexts/CurrentUserContext";
import { bankRoutes, customerRoutes, routes } from "lib/routes";
import BankAccounts from "pages/Bank/BankAccounts";
import Customer from "pages/Bank/Customer";
import Customers from "pages/Bank/Customers";
import CompanyProfilePage from "pages/Customer/CompanyProfile";
import LoansPage from "pages/Customer/Loans";
import PurchaseOrdersPage from "pages/Customer/PurchaseOrders";
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
        <Layout>
          <PrivateRoute exact path={routes.root}>
            <Home></Home>
          </PrivateRoute>
          <PrivateRoute exact path={routes.overview}>
            <Home></Home>
          </PrivateRoute>
          <PrivateRoute exact path={routes.vendors}>
            <Vendors></Vendors>
          </PrivateRoute>
          <PrivateRoute exact path={routes.profile}>
            <CompanyProfilePage></CompanyProfilePage>
          </PrivateRoute>
          <PrivateRoute path={routes.userProfile}>
            <UserProfile></UserProfile>
          </PrivateRoute>
          <PrivateRoute path={routes.users}>
            <Users></Users>
          </PrivateRoute>
          {/* Customer Routes */}
          <PrivateRoute
            exact
            path={customerRoutes.loans}
            requiredRoles={[UserRole.CompanyAdmin]}
          >
            <LoansPage></LoansPage>
          </PrivateRoute>
          <PrivateRoute
            exact
            path={customerRoutes.purchaseOrders}
            requiredRoles={[UserRole.CompanyAdmin]}
          >
            <PurchaseOrdersPage></PurchaseOrdersPage>
          </PrivateRoute>
          {/* Bank Routes */}
          <PrivateRoute
            exact
            path={bankRoutes.customers}
            requiredRoles={[UserRole.BankAdmin]}
          >
            <Customers></Customers>
          </PrivateRoute>
          <PrivateRoute
            path={bankRoutes.customer.root}
            requiredRoles={[UserRole.BankAdmin]}
          >
            <Customer></Customer>
          </PrivateRoute>
          <PrivateRoute
            exact
            path={bankRoutes.bankAccounts}
            requiredRoles={[UserRole.BankAdmin]}
          >
            <BankAccounts></BankAccounts>
          </PrivateRoute>
        </Layout>
      </Switch>
    </BrowserRouter>
  );
}

export default App;
