import "devextreme/dist/css/dx.common.css";
import "devextreme/dist/css/dx.material.blue.light.css";

import PrivateRoute from "components/Shared/PrivateRoute";
import {
  CurrentUserContext,
  isRoleBankUser,
} from "contexts/CurrentUserContext";
import { UserRolesEnum } from "generated/graphql";
import {
  anonymousRoutes,
  bankRoutes,
  customerRoutes,
  routes,
} from "lib/routes";
import AnonymousCompletePage from "pages/Anonymous/AnonymousCompletePage";
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
import VendorFormPage from "pages/Anonymous/VendorForm";
import BankAdvancesPage from "pages/Bank/Advances";
import BankAsyncPage from "pages/Bank/Async";
import BankClientSurveillancePage from "pages/Bank/ClientSurveillance";
import BankCompaniesPage from "pages/Bank/Companies";
import BankCompanyPage from "pages/Bank/Company";
import BankCustomersPage from "pages/Bank/Customers";
import BankDebtFacilityPage from "pages/Bank/DebtFacility";
import BankInvoicesPage from "pages/Bank/Invoices";
import BankLoansPage from "pages/Bank/Loans";
import BankMetrcPage from "pages/Bank/Metrc";
import BankOverviewPage from "pages/Bank/Overview";
import BankPartnershipsPage from "pages/Bank/Partnerships";
import BankPayorsPage from "pages/Bank/Payors";
import BankPurchaseOrdersPage from "pages/Bank/PurchaseOrders";
import BankRepaymentsPage from "pages/Bank/Repayments";
import BankReportsPage from "pages/Bank/Reports";
import BankSettingsPage from "pages/Bank/Settings";
import BankVendorsPage from "pages/Bank/Vendors";
import CustomerAccountPage from "pages/Customer/AccountFeesCredits";
import CustomerBorrowingBasePage from "pages/Customer/BorrowingBase";
import CustomerContractPage from "pages/Customer/Contract";
import CustomerFinancialCertificationsPage from "pages/Customer/FinancialCertifications";
import CustomerInvoicesPages from "pages/Customer/Invoices";
import CustomerLoansPage from "pages/Customer/Loans";
import CustomerLocationsPage from "pages/Customer/Locations";
import CustomerOverviewPage from "pages/Customer/Overview";
import CustomerPayorsPage from "pages/Customer/Payors";
import CustomerPurchaseOrdersPage from "pages/Customer/PurchaseOrders";
import CustomerRepaymentsPage from "pages/Customer/Repayments";
import CustomerReportsPage from "pages/Customer/Reports";
import CustomerSettingsPage from "pages/Customer/Settings";
import CustomerVendorsPage from "pages/Customer/Vendors";
import UserProfile from "pages/UserProfile";
import { useContext, useEffect } from "react";
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
import { useLocation } from "react-use";

const ValidBlazeOrigin = process.env.REACT_APP_BESPOKE_BLAZE_PARENT_ORIGIN;
// Global boolean to track if "message" event listener is already added.
// This is necessary since useEffect with an empty dependency array calls
// its callback twice in development environment in strict mode.
let IsEventListenerAdded = false;

export default function App() {
  const { pathname } = useLocation();
  const {
    user: { role },
  } = useContext(CurrentUserContext);

  useEffect(() => {
    if (IsEventListenerAdded) {
      return;
    } else {
      IsEventListenerAdded = true;
    }

    // If true, then app is open in an iframe element.
    if (window.location !== window.parent.location) {
      window.addEventListener(
        "message",
        (event) => {
          // Verify sender of message.
          if (event.origin !== ValidBlazeOrigin) {
            return;
          }

          console.info(
            "Received event from parent via postMessage...",
            event.data
          );

          const processError = (errorMessage: string) => {
            console.info(errorMessage);
            window.parent.postMessage(
              {
                identifier: "handshake_error",
                payload: {
                  message: errorMessage,
                },
              },
              ValidBlazeOrigin
            );
          };

          const eventIdentifier = event.data.identifier;
          const eventPayload = event.data.payload;
          if (!eventIdentifier) {
            processError("Failed to process event due to missing identifier!");
            return;
          }

          if (eventIdentifier === "handshake_response") {
            if (!eventPayload) {
              processError(
                `Failed to process ${eventIdentifier} event due to missing payload!`
              );
              return;
            }

            const {
              auth_key: authKey,
              company_id: blazeCompanyId,
              shop_id: blazeShopId,
              user_id: blazeUserId,
              user_role: blazeUserRole,
            }: {
              auth_key: string;
              company_id: string;
              shop_id: string;
              user_id: string;
              user_role: number;
            } = eventPayload;

            if (
              authKey == null ||
              blazeCompanyId == null ||
              blazeShopId == null ||
              blazeUserId == null ||
              blazeUserRole == null
            ) {
              processError(
                `Failed to process ${eventIdentifier} event due to missing payload field(s)!`
              );
              return;
            }

            // Trigger request to Python API server.

            console.info(`Processed ${eventIdentifier} event successfully!`);
            window.parent.postMessage(
              {
                identifier: "handshake_success",
                payload: null,
              },
              ValidBlazeOrigin
            );
          }
        },
        false
      );

      if (!!ValidBlazeOrigin) {
        window.parent.postMessage(
          {
            identifier: "handshake_request",
            payload: null,
          },
          ValidBlazeOrigin
        );
        console.info(
          "Sent handshake_request event from iframe via postMessage..."
        );
      } else {
        console.info(
          "Failed to send handshake_request event due to missing environment variable!"
        );
      }
    }
  }, []);

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
        {/* Reviewer user routes */}
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
        <Route
          exact
          path={anonymousRoutes.createVendor}
          component={VendorFormPage}
        />
        <Route
          exact
          path={anonymousRoutes.createVendorComplete}
          component={AnonymousCompletePage}
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
          {isRoleBankUser(role) ? (
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
          path={customerRoutes.reports}
          requiredRoles={[
            UserRolesEnum.CompanyAdmin,
            UserRolesEnum.CompanyReadOnly,
          ]}
        >
          <CustomerReportsPage />
        </PrivateRoute>
        <PrivateRoute
          exact
          path={customerRoutes.borrowingBase}
          requiredRoles={[
            UserRolesEnum.CompanyAdmin,
            UserRolesEnum.CompanyReadOnly,
          ]}
        >
          <CustomerBorrowingBasePage />
        </PrivateRoute>
        <PrivateRoute
          exact
          path={customerRoutes.financialCertifications}
          requiredRoles={[
            UserRolesEnum.CompanyAdmin,
            UserRolesEnum.CompanyReadOnly,
          ]}
        >
          <CustomerFinancialCertificationsPage />
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
          path={customerRoutes.locations}
          requiredRoles={[
            UserRolesEnum.CompanyAdmin,
            UserRolesEnum.CompanyReadOnly,
          ]}
        >
          <CustomerLocationsPage />
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
          path={customerRoutes.payments}
          requiredRoles={[
            UserRolesEnum.CompanyAdmin,
            UserRolesEnum.CompanyReadOnly,
          ]}
        >
          <CustomerRepaymentsPage />
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
        <PrivateRoute
          exact
          path={customerRoutes.account}
          requiredRoles={[
            UserRolesEnum.CompanyAdmin,
            UserRolesEnum.CompanyReadOnly,
          ]}
        >
          <CustomerAccountPage />
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
          exact
          path={bankRoutes.metrcRoot}
          requiredRoles={[UserRolesEnum.BankAdmin, UserRolesEnum.BankReadOnly]}
        >
          <BankMetrcPage />
        </PrivateRoute>
        <PrivateRoute
          exact
          path={bankRoutes.async}
          requiredRoles={[UserRolesEnum.BankAdmin, UserRolesEnum.BankReadOnly]}
        >
          <BankAsyncPage />
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
          path={bankRoutes.companies}
          requiredRoles={[UserRolesEnum.BankAdmin, UserRolesEnum.BankReadOnly]}
        >
          <BankCompaniesPage />
        </PrivateRoute>
        <PrivateRoute
          exact
          path={bankRoutes.debtFacility}
          requiredRoles={[UserRolesEnum.BankAdmin, UserRolesEnum.BankReadOnly]}
        >
          <BankDebtFacilityPage />
        </PrivateRoute>
        <PrivateRoute
          exact
          path={bankRoutes.customers}
          requiredRoles={[UserRolesEnum.BankAdmin, UserRolesEnum.BankReadOnly]}
        >
          <BankCustomersPage />
        </PrivateRoute>
        <PrivateRoute
          path={bankRoutes.companyRoot}
          requiredRoles={[UserRolesEnum.BankAdmin, UserRolesEnum.BankReadOnly]}
        >
          <BankCompanyPage />
        </PrivateRoute>
        <PrivateRoute
          exact
          path={bankRoutes.ebbaApplications}
          requiredRoles={[UserRolesEnum.BankAdmin, UserRolesEnum.BankReadOnly]}
        >
          <BankClientSurveillancePage />
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
          path={bankRoutes.payments}
          requiredRoles={[UserRolesEnum.BankAdmin, UserRolesEnum.BankReadOnly]}
        >
          <BankRepaymentsPage />
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
          path={bankRoutes.partnerships}
          requiredRoles={[UserRolesEnum.BankAdmin, UserRolesEnum.BankReadOnly]}
        >
          <BankPartnershipsPage />
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
