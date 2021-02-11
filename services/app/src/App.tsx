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
import ForgotPasswordPage from "pages/Anonymous/ForgotPassword";
import ResetPasswordPage from "pages/Anonymous/ResetPassword";
import ReviewPurchaseOrderPage from "pages/Anonymous/ReviewPurchaseOrder";
import ReviewPurchaseOrderCompletePage from "pages/Anonymous/ReviewPurchaseOrderComplete";
import SecureLinkPage from "pages/Anonymous/SecureLink";
import SignIn from "pages/Anonymous/SignIn";
import BankAdvancesPage from "pages/Bank/Advances";
import BankBankAccountsPage from "pages/Bank/BankAccounts";
import BankCustomerPage from "pages/Bank/Customer";
import BankCustomersPage from "pages/Bank/Customers";
import BankEbbaApplicationsPage from "pages/Bank/EbbaApplications";
import BankLoansAllProductsPage from "pages/Bank/LoansAllProducts";
import BankLoansApprovalRequestedPage from "pages/Bank/LoansApprovalRequested";
import BankLoansMaturingPage from "pages/Bank/LoansMaturing";
import BankLoansPastDuePage from "pages/Bank/LoansPastDue";
import BankOverviewPage from "pages/Bank/Overview";
import BankPaymentsPage from "pages/Bank/Payments";
import BankTransactionsPage from "pages/Bank/Transactions";
import BankVendorsPage from "pages/Bank/Vendors";
import CustomerCompanyProfilePage from "pages/Customer/CompanyProfile";
import CustomerLoansPage from "pages/Customer/Loans";
import CustomerOverviewPage from "pages/Customer/Overview";
import CustomerPurchaseOrdersPage from "pages/Customer/PurchaseOrders";
import CustomerSettingsPage from "pages/Customer/Settings";
import CustomerVendorsPage from "pages/Customer/Vendors";
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
        <Route
          exact
          path={anonymousRoutes.resetPassword}
          component={ResetPasswordPage}
        ></Route>
        <Route
          exact
          path={anonymousRoutes.forgotPassword}
          component={ForgotPasswordPage}
        ></Route>
        {/* Bank and Company user routes */}
        <PrivateRoute
          exact
          path={routes.root}
          requiredRoles={[UserRolesEnum.BankAdmin, UserRolesEnum.CompanyAdmin]}
        >
          {role === UserRolesEnum.BankAdmin ? (
            <Redirect to={bankRoutes.overview}></Redirect>
          ) : (
            <Redirect to={customerRoutes.overview}></Redirect>
          )}
        </PrivateRoute>
        <PrivateRoute
          path={routes.userProfile}
          requiredRoles={[UserRolesEnum.BankAdmin, UserRolesEnum.CompanyAdmin]}
        >
          <UserProfile></UserProfile>
        </PrivateRoute>
        <PrivateRoute
          path={routes.users}
          requiredRoles={[UserRolesEnum.BankAdmin, UserRolesEnum.CompanyAdmin]}
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
          path={customerRoutes.companyProfile}
          requiredRoles={[UserRolesEnum.CompanyAdmin]}
        >
          <CustomerCompanyProfilePage></CustomerCompanyProfilePage>
        </PrivateRoute>
        <PrivateRoute
          exact
          path={customerRoutes.loans}
          requiredRoles={[UserRolesEnum.CompanyAdmin]}
        >
          <CustomerLoansPage></CustomerLoansPage>
        </PrivateRoute>
        <PrivateRoute
          exact
          path={customerRoutes.purchaseOrders}
          requiredRoles={[UserRolesEnum.CompanyAdmin]}
        >
          <CustomerPurchaseOrdersPage></CustomerPurchaseOrdersPage>
        </PrivateRoute>
        <PrivateRoute
          exact
          path={customerRoutes.settings}
          requiredRoles={[UserRolesEnum.CompanyAdmin]}
        >
          <CustomerSettingsPage></CustomerSettingsPage>
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
          <BankOverviewPage></BankOverviewPage>
        </PrivateRoute>
        <PrivateRoute
          exact
          path={bankRoutes.loansApprovalRequested}
          requiredRoles={[UserRolesEnum.BankAdmin]}
        >
          <BankLoansApprovalRequestedPage></BankLoansApprovalRequestedPage>
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
          path={bankRoutes.customers}
          requiredRoles={[UserRolesEnum.BankAdmin]}
        >
          <BankCustomersPage></BankCustomersPage>
        </PrivateRoute>
        <PrivateRoute
          path={bankRoutes.customerRoot}
          requiredRoles={[UserRolesEnum.BankAdmin]}
        >
          <BankCustomerPage></BankCustomerPage>
        </PrivateRoute>
        <PrivateRoute
          exact
          path={bankRoutes.ebbaApplications}
          requiredRoles={[UserRolesEnum.BankAdmin]}
        >
          <BankEbbaApplicationsPage></BankEbbaApplicationsPage>
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
          path={bankRoutes.payments}
          requiredRoles={[UserRolesEnum.BankAdmin]}
        >
          <BankPaymentsPage></BankPaymentsPage>
        </PrivateRoute>
        <PrivateRoute
          exact
          path={bankRoutes.advances}
          requiredRoles={[UserRolesEnum.BankAdmin]}
        >
          <BankAdvancesPage></BankAdvancesPage>
        </PrivateRoute>
        <PrivateRoute
          exact
          path={bankRoutes.transactions}
          requiredRoles={[UserRolesEnum.BankAdmin]}
        >
          <BankTransactionsPage></BankTransactionsPage>
        </PrivateRoute>
        <PrivateRoute
          exact
          path={bankRoutes.vendors}
          requiredRoles={[UserRolesEnum.BankAdmin]}
        >
          <BankVendorsPage></BankVendorsPage>
        </PrivateRoute>
        <Route>
          <Redirect to={routes.root}></Redirect>
        </Route>
      </Switch>
    </BrowserRouter>
  );
}

export default App;
