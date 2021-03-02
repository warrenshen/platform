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
import BankLoansActionRequiredPage from "pages/Bank/LoansActionRequired";
import BankLoansAllProductsPage from "pages/Bank/LoansAllProducts";
import BankLoansMaturingPage from "pages/Bank/LoansMaturing";
import BankLoansPastDuePage from "pages/Bank/LoansPastDue";
import BankOverviewPage from "pages/Bank/Overview";
import BankPaymentsPage from "pages/Bank/Payments";
import BankPaymentsReadyForSettlementPage from "pages/Bank/PaymentsActionRequired";
import BankPurchaseOrdersPage from "pages/Bank/PurchaseOrders";
import BankTransactionsPage from "pages/Bank/Transactions";
import BankVendorsPage from "pages/Bank/Vendors";
import CustomerContractPage from "pages/Customer/Contract";
import CustomerEbbaApplicationsPage from "pages/Customer/EbbaApplications";
import CustomerLoansActivePage from "pages/Customer/LoansActive";
import CustomerLoansClosedPage from "pages/Customer/LoansClosed";
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
          requiredRoles={[
            UserRolesEnum.BankAdmin,
            UserRolesEnum.BankReadOnly,
            UserRolesEnum.CompanyAdmin,
            UserRolesEnum.CompanyReadOnly,
          ]}
        >
          {role === UserRolesEnum.BankAdmin ? (
            <Redirect to={bankRoutes.overview} />
          ) : (
            <Redirect to={customerRoutes.overview} />
          )}
        </PrivateRoute>
        <PrivateRoute
          path={routes.userProfile}
          requiredRoles={[
            UserRolesEnum.BankAdmin,
            UserRolesEnum.BankReadOnly,
            UserRolesEnum.CompanyAdmin,
            UserRolesEnum.CompanyReadOnly,
          ]}
        >
          <UserProfile />
        </PrivateRoute>
        <PrivateRoute
          path={routes.users}
          requiredRoles={[
            UserRolesEnum.BankAdmin,
            UserRolesEnum.BankReadOnly,
            UserRolesEnum.CompanyAdmin,
            UserRolesEnum.CompanyReadOnly,
          ]}
        >
          <Users />
        </PrivateRoute>
        {/* Customer user routes */}
        <PrivateRoute
          exact
          path={customerRoutes.overview}
          requiredRoles={[
            UserRolesEnum.CompanyAdmin,
            UserRolesEnum.CompanyReadOnly,
          ]}
        >
          <CustomerOverviewPage />
        </PrivateRoute>
        <PrivateRoute
          exact
          path={customerRoutes.contract}
          requiredRoles={[
            UserRolesEnum.CompanyAdmin,
            UserRolesEnum.CompanyReadOnly,
          ]}
        >
          <CustomerContractPage />
        </PrivateRoute>
        <PrivateRoute
          exact
          path={customerRoutes.ebbaApplications}
          requiredRoles={[
            UserRolesEnum.CompanyAdmin,
            UserRolesEnum.CompanyReadOnly,
          ]}
        >
          <CustomerEbbaApplicationsPage />
        </PrivateRoute>
        <PrivateRoute
          exact
          path={customerRoutes.loansActive}
          requiredRoles={[
            UserRolesEnum.CompanyAdmin,
            UserRolesEnum.CompanyReadOnly,
          ]}
        >
          <CustomerLoansActivePage />
        </PrivateRoute>
        <PrivateRoute
          exact
          path={customerRoutes.loansClosed}
          requiredRoles={[
            UserRolesEnum.CompanyAdmin,
            UserRolesEnum.CompanyReadOnly,
          ]}
        >
          <CustomerLoansClosedPage />
        </PrivateRoute>
        <PrivateRoute
          exact
          path={customerRoutes.purchaseOrders}
          requiredRoles={[
            UserRolesEnum.CompanyAdmin,
            UserRolesEnum.CompanyReadOnly,
          ]}
        >
          <CustomerPurchaseOrdersPage />
        </PrivateRoute>
        <PrivateRoute
          exact
          path={customerRoutes.settings}
          requiredRoles={[
            UserRolesEnum.CompanyAdmin,
            UserRolesEnum.CompanyReadOnly,
          ]}
        >
          <CustomerSettingsPage />
        </PrivateRoute>
        <PrivateRoute
          exact
          path={customerRoutes.vendors}
          requiredRoles={[
            UserRolesEnum.CompanyAdmin,
            UserRolesEnum.CompanyReadOnly,
          ]}
        >
          <CustomerVendorsPage />
        </PrivateRoute>
        {/* Bank user routes */}
        <PrivateRoute
          exact
          path={bankRoutes.overview}
          requiredRoles={[UserRolesEnum.BankAdmin, UserRolesEnum.BankReadOnly]}
        >
          <BankOverviewPage />
        </PrivateRoute>
        <PrivateRoute
          exact
          path={bankRoutes.loansActionRequired}
          requiredRoles={[UserRolesEnum.BankAdmin, UserRolesEnum.BankReadOnly]}
        >
          <BankLoansActionRequiredPage />
        </PrivateRoute>
        <PrivateRoute
          exact
          path={bankRoutes.loansMaturing}
          requiredRoles={[UserRolesEnum.BankAdmin, UserRolesEnum.BankReadOnly]}
        >
          <BankLoansMaturingPage />
        </PrivateRoute>
        <PrivateRoute
          exact
          path={bankRoutes.loansPastDue}
          requiredRoles={[UserRolesEnum.BankAdmin, UserRolesEnum.BankReadOnly]}
        >
          <BankLoansPastDuePage />
        </PrivateRoute>
        <PrivateRoute
          path={bankRoutes.loansAllProducts}
          requiredRoles={[UserRolesEnum.BankAdmin, UserRolesEnum.BankReadOnly]}
        >
          <BankLoansAllProductsPage />
        </PrivateRoute>
        <PrivateRoute
          path={bankRoutes.purchaseOrders}
          requiredRoles={[UserRolesEnum.BankAdmin, UserRolesEnum.BankReadOnly]}
        >
          <BankPurchaseOrdersPage />
        </PrivateRoute>
        <PrivateRoute
          exact
          path={bankRoutes.customers}
          requiredRoles={[UserRolesEnum.BankAdmin, UserRolesEnum.BankReadOnly]}
        >
          <BankCustomersPage />
        </PrivateRoute>
        <PrivateRoute
          path={bankRoutes.customerRoot}
          requiredRoles={[UserRolesEnum.BankAdmin, UserRolesEnum.BankReadOnly]}
        >
          <BankCustomerPage />
        </PrivateRoute>
        <PrivateRoute
          exact
          path={bankRoutes.ebbaApplications}
          requiredRoles={[UserRolesEnum.BankAdmin, UserRolesEnum.BankReadOnly]}
        >
          <BankEbbaApplicationsPage />
        </PrivateRoute>
        <PrivateRoute
          exact
          path={bankRoutes.bankAccounts}
          requiredRoles={[UserRolesEnum.BankAdmin, UserRolesEnum.BankReadOnly]}
        >
          <BankBankAccountsPage />
        </PrivateRoute>
        <PrivateRoute
          exact
          path={bankRoutes.payments}
          requiredRoles={[UserRolesEnum.BankAdmin, UserRolesEnum.BankReadOnly]}
        >
          <BankPaymentsPage />
        </PrivateRoute>
        <PrivateRoute
          exact
          path={bankRoutes.paymentsActionRequired}
          requiredRoles={[UserRolesEnum.BankAdmin, UserRolesEnum.BankReadOnly]}
        >
          <BankPaymentsReadyForSettlementPage />
        </PrivateRoute>
        <PrivateRoute
          exact
          path={bankRoutes.advances}
          requiredRoles={[UserRolesEnum.BankAdmin, UserRolesEnum.BankReadOnly]}
        >
          <BankAdvancesPage />
        </PrivateRoute>
        <PrivateRoute
          exact
          path={bankRoutes.transactions}
          requiredRoles={[UserRolesEnum.BankAdmin, UserRolesEnum.BankReadOnly]}
        >
          <BankTransactionsPage />
        </PrivateRoute>
        <PrivateRoute
          exact
          path={bankRoutes.vendors}
          requiredRoles={[UserRolesEnum.BankAdmin, UserRolesEnum.BankReadOnly]}
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
