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
import LoansAllProductsPage from "pages/Bank/LoansAllProducts";
import LoansLineOfCreditPage from "pages/Bank/LoansLineOfCredit";
import LoansMaturingPage from "pages/Bank/LoansMaturing";
import LoansPastDuePage from "pages/Bank/LoansPastDue";
import LoansPurchaseOrderPage from "pages/Bank/LoansPurchaseOrder";
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
        {/* Purchase Order Reviewer user routes */}
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
        {/* Bank and Company user routes */}
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
          {/* Company user routes */}
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
          {/* Bank user routes */}
          <PrivateRoute
            exact
            path={bankRoutes.loansMaturing}
            requiredRoles={[UserRolesEnum.BankAdmin]}
          >
            <LoansMaturingPage></LoansMaturingPage>
          </PrivateRoute>
          <PrivateRoute
            exact
            path={bankRoutes.loansPastDue}
            requiredRoles={[UserRolesEnum.BankAdmin]}
          >
            <LoansPastDuePage></LoansPastDuePage>
          </PrivateRoute>
          <PrivateRoute
            path={bankRoutes.loansAllProducts}
            requiredRoles={[UserRolesEnum.BankAdmin]}
          >
            <LoansAllProductsPage></LoansAllProductsPage>
          </PrivateRoute>
          <PrivateRoute
            exact
            path={bankRoutes.loansPurchaseOrder}
            requiredRoles={[UserRolesEnum.BankAdmin]}
          >
            <LoansPurchaseOrderPage></LoansPurchaseOrderPage>
          </PrivateRoute>
          <PrivateRoute
            exact
            path={bankRoutes.loansLineOfCredit}
            requiredRoles={[UserRolesEnum.BankAdmin]}
          >
            <LoansLineOfCreditPage></LoansLineOfCreditPage>
          </PrivateRoute>
        </Layout>
      </Switch>
    </BrowserRouter>
  );
}

export default App;
