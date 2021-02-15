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
import BankPurchaseOrdersPage from "pages/Bank/PurchaseOrders";
import BankTransactionsPage from "pages/Bank/Transactions";
import BankVendorsPage from "pages/Bank/Vendors";
import CustomerCompanyProfilePage from "pages/Customer/CompanyProfile";
import CustomerEbbaApplicationsPage from "pages/Customer/EbbaApplications";
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
        <Redirect from="/:url*(/+)" to={pathname?.slice(0, -1) || "/"} />
        <Route exact path={routes.signIn}>
          <SignIn />
        </Route>
        <Route exact path={anonymousRoutes.secureLink}>
          <SecureLinkPage />
        </Route>
        {/* Purchase Order Reviewer user routes */}
        <Route
          exact
          path={anonymousRoutes.reviewPurchaseOrder}
          component={ReviewPurchaseOrderPage}
        />
        <Route
          exact
          path={anonymousRoutes.reviewPurchaseOrderComplete}
          component={ReviewPurchaseOrderCompletePage}
        />
        <Route
          exact
          path={anonymousRoutes.resetPassword}
          component={ResetPasswordPage}
        />
        <Route
          exact
          path={anonymousRoutes.forgotPassword}
          component={ForgotPasswordPage}
        />
        {/* Bank and Company user routes */}
        <PrivateRoute
          exact
          path={routes.root}
          requiredRoles={[UserRolesEnum.BankAdmin, UserRolesEnum.CompanyAdmin]}
        >
          {role === UserRolesEnum.BankAdmin ? (
            <Redirect to={bankRoutes.overview} />
          ) : (
            <Redirect to={customerRoutes.overview} />
          )}
        </PrivateRoute>
        <PrivateRoute
          path={routes.userProfile}
          requiredRoles={[UserRolesEnum.BankAdmin, UserRolesEnum.CompanyAdmin]}
        >
          <UserProfile />
        </PrivateRoute>
        <PrivateRoute
          path={routes.users}
          requiredRoles={[UserRolesEnum.BankAdmin, UserRolesEnum.CompanyAdmin]}
        >
          <Users />
        </PrivateRoute>
        {/* Customer user routes */}
        <PrivateRoute
          exact
          path={customerRoutes.overview}
          requiredRoles={[UserRolesEnum.CompanyAdmin]}
        >
          <CustomerOverviewPage />
        </PrivateRoute>
        <PrivateRoute
          exact
          path={customerRoutes.companyProfile}
          requiredRoles={[UserRolesEnum.CompanyAdmin]}
        >
          <CustomerCompanyProfilePage />
        </PrivateRoute>
        <PrivateRoute
          exact
          path={customerRoutes.ebbaApplications}
          requiredRoles={[UserRolesEnum.CompanyAdmin]}
        >
          <CustomerEbbaApplicationsPage />
        </PrivateRoute>
        <PrivateRoute
          exact
          path={customerRoutes.loans}
          requiredRoles={[UserRolesEnum.CompanyAdmin]}
        >
          <CustomerLoansPage />
        </PrivateRoute>
        <PrivateRoute
          exact
          path={customerRoutes.purchaseOrders}
          requiredRoles={[UserRolesEnum.CompanyAdmin]}
        >
          <CustomerPurchaseOrdersPage />
        </PrivateRoute>
        <PrivateRoute
          exact
          path={customerRoutes.settings}
          requiredRoles={[UserRolesEnum.CompanyAdmin]}
        >
          <CustomerSettingsPage />
        </PrivateRoute>
        <PrivateRoute
          exact
          path={customerRoutes.vendors}
          requiredRoles={[UserRolesEnum.CompanyAdmin]}
        >
          <CustomerVendorsPage />
        </PrivateRoute>
        {/* Bank user routes */}
        <PrivateRoute
          exact
          path={bankRoutes.overview}
          requiredRoles={[UserRolesEnum.BankAdmin]}
        >
          <BankOverviewPage />
        </PrivateRoute>
        <PrivateRoute
          exact
          path={bankRoutes.loansApprovalRequested}
          requiredRoles={[UserRolesEnum.BankAdmin]}
        >
          <BankLoansApprovalRequestedPage />
        </PrivateRoute>
        <PrivateRoute
          exact
          path={bankRoutes.loansMaturing}
          requiredRoles={[UserRolesEnum.BankAdmin]}
        >
          <BankLoansMaturingPage />
        </PrivateRoute>
        <PrivateRoute
          exact
          path={bankRoutes.loansPastDue}
          requiredRoles={[UserRolesEnum.BankAdmin]}
        >
          <BankLoansPastDuePage />
        </PrivateRoute>
        <PrivateRoute
          path={bankRoutes.loansAllProducts}
          requiredRoles={[UserRolesEnum.BankAdmin]}
        >
          <BankLoansAllProductsPage />
        </PrivateRoute>
        <PrivateRoute
          path={bankRoutes.purchaseOrders}
          requiredRoles={[UserRolesEnum.BankAdmin]}
        >
          <BankPurchaseOrdersPage />
        </PrivateRoute>
        <PrivateRoute
          exact
          path={bankRoutes.customers}
          requiredRoles={[UserRolesEnum.BankAdmin]}
        >
          <BankCustomersPage />
        </PrivateRoute>
        <PrivateRoute
          path={bankRoutes.customerRoot}
          requiredRoles={[UserRolesEnum.BankAdmin]}
        >
          <BankCustomerPage />
        </PrivateRoute>
        <PrivateRoute
          exact
          path={bankRoutes.ebbaApplications}
          requiredRoles={[UserRolesEnum.BankAdmin]}
        >
          <BankEbbaApplicationsPage />
        </PrivateRoute>
        <PrivateRoute
          exact
          path={bankRoutes.bankAccounts}
          requiredRoles={[UserRolesEnum.BankAdmin]}
        >
          <BankBankAccountsPage />
        </PrivateRoute>
        <PrivateRoute
          exact
          path={bankRoutes.payments}
          requiredRoles={[UserRolesEnum.BankAdmin]}
        >
          <BankPaymentsPage />
        </PrivateRoute>
        <PrivateRoute
          exact
          path={bankRoutes.advances}
          requiredRoles={[UserRolesEnum.BankAdmin]}
        >
          <BankAdvancesPage />
        </PrivateRoute>
        <PrivateRoute
          exact
          path={bankRoutes.transactions}
          requiredRoles={[UserRolesEnum.BankAdmin]}
        >
          <BankTransactionsPage />
        </PrivateRoute>
        <PrivateRoute
          exact
          path={bankRoutes.vendors}
          requiredRoles={[UserRolesEnum.BankAdmin]}
        >
          <BankVendorsPage />
        </PrivateRoute>
        <Route>
          <Redirect to={routes.root} />
        </Route>
      </Switch>
    </BrowserRouter>
  );
}

export default App;
