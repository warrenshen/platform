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
import ReviewInvoicePage from "pages/Anonymous/ReviewInvoice";
import ReviewInvoiceCompletePage from "pages/Anonymous/ReviewInvoiceComplete";
import ReviewInvoicePaymentPage from "pages/Anonymous/ReviewInvoicePayment";
import ReviewInvoicePaymentCompletePage from "pages/Anonymous/ReviewInvoicePaymentComplete";
import ReviewPurchaseOrderPage from "pages/Anonymous/ReviewPurchaseOrder";
import ReviewPurchaseOrderCompletePage from "pages/Anonymous/ReviewPurchaseOrderComplete";
import AnonymousSecureLinkPage from "pages/Anonymous/SecureLink";
import SignIn from "pages/Anonymous/SignIn";
import BankAdvancesPage from "pages/Bank/Advances";
import BankCustomerPage from "pages/Bank/Customer";
import BankCustomersPage from "pages/Bank/Customers";
import BankEbbaApplicationsPage from "pages/Bank/EbbaApplications";
import BankInvoicesPage from "pages/Bank/Invoices";
import BankLoansPage from "pages/Bank/Loans";
import BankOverviewPage from "pages/Bank/Overview";
import BankPaymentsPage from "pages/Bank/Payments";
import BankPayorsPage from "pages/Bank/Payors";
import BankPurchaseOrdersPage from "pages/Bank/PurchaseOrders";
import BankReportsPage from "pages/Bank/Reports";
import BankSettingsPage from "pages/Bank/Settings";
import BankTransactionsPage from "pages/Bank/Transactions";
import BankVendorsPage from "pages/Bank/Vendors";
import CustomerContractPage from "pages/Customer/Contract";
import CustomerEbbaApplicationsPage from "pages/Customer/EbbaApplications";
import CustomerInvoicesPages from "pages/Customer/Invoices";
import CustomerLoansPage from "pages/Customer/Loans";
import CustomerOverviewPage from "pages/Customer/Overview";
import CustomerPayorsPage from "pages/Customer/Payors";
import CustomerPurchaseOrdersPage from "pages/Customer/PurchaseOrders";
import CustomerSettingsPage from "pages/Customer/Settings";
import CustomerVendorsPage from "pages/Customer/Vendors";
import UserProfile from "pages/UserProfile";
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
          <AnonymousSecureLinkPage />
        </Route>
        {/*  Reviewer user routes */}
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
          path={anonymousRoutes.reviewInvoice}
          component={ReviewInvoicePage}
        />
        <Route
          exact
          path={anonymousRoutes.reviewInvoiceComplete}
          component={ReviewInvoiceCompletePage}
        />

        <Route
          exact
          path={anonymousRoutes.reviewInvoicePayment}
          component={ReviewInvoicePaymentPage}
        />
        <Route
          exact
          path={anonymousRoutes.reviewInvoicePaymentComplete}
          component={ReviewInvoicePaymentCompletePage}
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
          path={customerRoutes.loans}
          requiredRoles={[
            UserRolesEnum.CompanyAdmin,
            UserRolesEnum.CompanyReadOnly,
          ]}
        >
          <CustomerLoansPage />
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
          path={customerRoutes.invoices}
          requiredRoles={[
            UserRolesEnum.CompanyAdmin,
            UserRolesEnum.CompanyReadOnly,
          ]}
        >
          <CustomerInvoicesPages />
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
        <PrivateRoute
          exact
          path={customerRoutes.payors}
          requiredRoles={[
            UserRolesEnum.CompanyAdmin,
            UserRolesEnum.CompanyReadOnly,
          ]}
        >
          <CustomerPayorsPage />
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
          path={bankRoutes.loans}
          requiredRoles={[UserRolesEnum.BankAdmin, UserRolesEnum.BankReadOnly]}
        >
          <BankLoansPage />
        </PrivateRoute>
        <PrivateRoute
          path={bankRoutes.purchaseOrders}
          requiredRoles={[UserRolesEnum.BankAdmin, UserRolesEnum.BankReadOnly]}
        >
          <BankPurchaseOrdersPage />
        </PrivateRoute>
        <PrivateRoute
          path={bankRoutes.invoices}
          requiredRoles={[UserRolesEnum.BankAdmin, UserRolesEnum.BankReadOnly]}
        >
          <BankInvoicesPage />
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
          path={bankRoutes.payments}
          requiredRoles={[UserRolesEnum.BankAdmin, UserRolesEnum.BankReadOnly]}
        >
          <BankPaymentsPage />
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
        <PrivateRoute
          exact
          path={bankRoutes.payors}
          requiredRoles={[UserRolesEnum.BankAdmin, UserRolesEnum.BankReadOnly]}
        >
          <BankPayorsPage />
        </PrivateRoute>
        <PrivateRoute
          exact
          path={bankRoutes.reports}
          requiredRoles={[UserRolesEnum.BankAdmin, UserRolesEnum.BankReadOnly]}
        >
          <BankReportsPage />
        </PrivateRoute>
        <PrivateRoute
          exact
          path={bankRoutes.settings}
          requiredRoles={[UserRolesEnum.BankAdmin, UserRolesEnum.BankReadOnly]}
        >
          <BankSettingsPage />
        </PrivateRoute>
        <Route>
          <Redirect to={routes.root} />
        </Route>
      </Switch>
    </BrowserRouter>
  );
}

export default App;
