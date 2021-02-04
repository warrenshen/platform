import Layout from "components/Shared/Layout";
import PrivateRoute from "components/Shared/PrivateRoute";
import { CurrentUserContext } from "contexts/CurrentUserContext";
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
import BankBankAccountsPage from "pages/Bank/BankAccounts";
import BankCustomerPage from "pages/Bank/Customer";
import BankCustomersPage from "pages/Bank/Customers";
import BankLoansAllProductsPage from "pages/Bank/LoansAllProducts";
import BankLoansLineOfCreditPage from "pages/Bank/LoansLineOfCredit";
import BankLoansMaturingPage from "pages/Bank/LoansMaturing";
import BankLoansPastDuePage from "pages/Bank/LoansPastDue";
import BankLoansPurchaseOrderPage from "pages/Bank/LoansPurchaseOrder";
import BankVendors from "pages/Bank/Vendors";
import CompanyProfilePage from "pages/Customer/CompanyProfile";
import {
  default as CustomerVendorsPage,
  default as LoansPage,
} from "pages/Customer/Loans";
import CustomerOverviewPage from "pages/Customer/Overview";
import PurchaseOrdersPage from "pages/Customer/PurchaseOrders";
import SettingsPage from "pages/Customer/Settings";
import Home from "pages/Home";
import SignIn from "pages/SignIn";
import UserProfile from "pages/UserProfile";
import Users from "pages/Users";
import { useContext } from "react";
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
import { useLocation } from "react-use";

function App() {
  const { pathname } = useLocation();
  const {
    user: { role },
  } = useContext(CurrentUserContext);

  return (
    <BrowserRouter>
      <Switch>
        <Redirect
          from="/:url*(/+)"
          to={pathname?.slice(0, -1) || "/"}
        ></Redirect>
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
            {role === UserRolesEnum.BankAdmin ? (
              <Redirect to={bankRoutes.overview}></Redirect>
            ) : (
              <Redirect to={customerRoutes.overview}></Redirect>
            )}
          </PrivateRoute>
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
          {/* Customer user routes */}
          <PrivateRoute
            exact
            path={customerRoutes.overview}
            requiredRoles={[UserRolesEnum.CompanyAdmin]}
          >
            <CustomerOverviewPage></CustomerOverviewPage>
          </PrivateRoute>
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
          <PrivateRoute
            exact
            path={customerRoutes.vendors}
            requiredRoles={[UserRolesEnum.CompanyAdmin]}
          >
            <CustomerVendorsPage></CustomerVendorsPage>
          </PrivateRoute>
          {/* Bank user routes */}
          <PrivateRoute
            exact
            path={bankRoutes.overview}
            requiredRoles={[UserRolesEnum.BankAdmin]}
          >
            <Home></Home>
          </PrivateRoute>
          <PrivateRoute
            exact
            path={bankRoutes.loansMaturing}
            requiredRoles={[UserRolesEnum.BankAdmin]}
          >
            <BankLoansMaturingPage></BankLoansMaturingPage>
          </PrivateRoute>
          <PrivateRoute
            exact
            path={bankRoutes.loansPastDue}
            requiredRoles={[UserRolesEnum.BankAdmin]}
          >
            <BankLoansPastDuePage></BankLoansPastDuePage>
          </PrivateRoute>
          <PrivateRoute
            path={bankRoutes.loansAllProducts}
            requiredRoles={[UserRolesEnum.BankAdmin]}
          >
            <BankLoansAllProductsPage></BankLoansAllProductsPage>
          </PrivateRoute>
          <PrivateRoute
            exact
            path={bankRoutes.loansPurchaseOrder}
            requiredRoles={[UserRolesEnum.BankAdmin]}
          >
            <BankLoansPurchaseOrderPage></BankLoansPurchaseOrderPage>
          </PrivateRoute>
          <PrivateRoute
            exact
            path={bankRoutes.loansLineOfCredit}
            requiredRoles={[UserRolesEnum.BankAdmin]}
          >
            <BankLoansLineOfCreditPage></BankLoansLineOfCreditPage>
          </PrivateRoute>
          <PrivateRoute
            exact
            path={bankRoutes.customers}
            requiredRoles={[UserRolesEnum.BankAdmin]}
          >
            <BankCustomersPage></BankCustomersPage>
          </PrivateRoute>
          <PrivateRoute
            path={bankRoutes.customer.root}
            requiredRoles={[UserRolesEnum.BankAdmin]}
          >
            <BankCustomerPage></BankCustomerPage>
          </PrivateRoute>
          <PrivateRoute
            exact
            path={bankRoutes.bankAccounts}
            requiredRoles={[UserRolesEnum.BankAdmin]}
          >
            <BankBankAccountsPage></BankBankAccountsPage>
          </PrivateRoute>
          <PrivateRoute
            exact
            path={bankRoutes.vendors}
            requiredRoles={[UserRolesEnum.BankAdmin]}
          >
            <BankVendors></BankVendors>
          </PrivateRoute>
        </Layout>
      </Switch>
    </BrowserRouter>
  );
}

export default App;
