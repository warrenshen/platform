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
import BankCompanyCustomerAccountPage from "pages/Bank/Company/Customer/Account";
import BankCompanyCustomerBorrowingBasePage from "pages/Bank/Company/Customer/BorrowingBase";
import BankCompanyCustomerContractPage from "pages/Bank/Company/Customer/Contract";
import BankCompanyCustomerFinancialCertificationsPage from "pages/Bank/Company/Customer/FinancialCertifications";
import BankCompanyCustomerFinancingRequestsPage from "pages/Bank/Company/Customer/FinancingRequests";
import BankCompanyCustomerInvoicesPage from "pages/Bank/Company/Customer/Invoices";
import BankCompanyCustomerLoansPage from "pages/Bank/Company/Customer/Loans";
import BankCompanyCustomerMetrcPage from "pages/Bank/Company/Customer/Metrc";
import BankCompanyCustomerOverviewPage from "pages/Bank/Company/Customer/Overview";
import BankCompanyCustomerPayorsPage from "pages/Bank/Company/Customer/Payors";
import BankCompanyCustomerPurchaseOrdersPage from "pages/Bank/Company/Customer/PurchaseOrders";
import BankCompanyCustomerRepaymentsPage from "pages/Bank/Company/Customer/Repayments";
import BankCompanyCustomerReportsPage from "pages/Bank/Company/Customer/Reports";
import BankCompanyCustomerSettingsPage from "pages/Bank/Company/Customer/Settings";
import BankCompanyCustomerVendorsPage from "pages/Bank/Company/Customer/Vendors";
import BankCompanyPayorPartnershipsPage from "pages/Bank/Company/Payor/PayorPartnerships";
import BankCompanyVendorPartnershipsPage from "pages/Bank/Company/Vendor/VendorPartnerships";
import BankCustomersPage from "pages/Bank/Customers";
import BankDebtFacilityPage from "pages/Bank/DebtFacility";
import BankFinancingRequestsPage from "pages/Bank/FinancingRequests";
import BankInvoicesPage from "pages/Bank/Invoices";
import BankLoansPageNew from "pages/Bank/LoansNew";
import BankMetrcPage from "pages/Bank/Metrc";
import BankOverviewPage from "pages/Bank/Overview";
import BankPartnershipsPage from "pages/Bank/Partnerships";
import BankPayorsPage from "pages/Bank/Payors";
import BankProductCatalogPage from "pages/Bank/ProductCatalog";
import BankPurchaseOrdersPageNew from "pages/Bank/PurchaseOrdersNew";
import BankRepaymentsPage from "pages/Bank/Repayments";
import BankReportsPage from "pages/Bank/Reports";
import BankSettingsPage from "pages/Bank/Settings";
import BankVendorsPage from "pages/Bank/Vendors";
import CustomerAccountPage from "pages/Customer/AccountFeesCredits";
import CustomerBorrowingBasePage from "pages/Customer/BorrowingBase";
import CustomerContractPage from "pages/Customer/Contract";
import CustomerFinancialCertificationsPage from "pages/Customer/FinancialCertifications";
import CustomerFinancingRequestsPage from "pages/Customer/FinancingRequests";
import CustomerInvoicesPages from "pages/Customer/Invoices";
import CustomerLoansPageNew from "pages/Customer/LoansNew";
import CustomerLocationsPage from "pages/Customer/Locations";
import CustomerOverviewPage from "pages/Customer/Overview";
import CustomerPayorsPage from "pages/Customer/Payors";
import CustomerPurchaseOrdersPage from "pages/Customer/PurchaseOrders";
import CustomerRepaymentsPage from "pages/Customer/Repayments";
import CustomerReportsPage from "pages/Customer/Reports";
import CustomerSettingsPage from "pages/Customer/Settings";
import CustomerVendorsPage from "pages/Customer/Vendors";
import UserProfile from "pages/UserProfile";
import { useContext } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

export default function App() {
  const {
    user: { role },
  } = useContext(CurrentUserContext);
  return (
    <BrowserRouter>
      <Routes>
        <Route path={routes.signIn} element={<SignIn />} />
        <Route
          path={anonymousRoutes.secureLink}
          element={<AnonymousSecureLinkPage />}
        />
        <Route
          path={anonymousRoutes.secureLinkNew}
          element={<AnonymousSecureLinkPage />}
        />
        {/* Reviewer user routes */}
        <Route
          path={anonymousRoutes.reviewPurchaseOrder}
          element={<ReviewPurchaseOrderPage />}
        />
        <Route
          path={anonymousRoutes.reviewPurchaseOrderComplete}
          element={<ReviewPurchaseOrderCompletePage />}
        />
        <Route
          path={anonymousRoutes.reviewInvoice}
          element={<ReviewInvoicePage />}
        />
        <Route
          path={anonymousRoutes.reviewInvoiceComplete}
          element={<ReviewInvoiceCompletePage />}
        />
        <Route
          path={anonymousRoutes.reviewInvoicePayment}
          element={<ReviewInvoicePaymentPage />}
        />
        <Route
          path={anonymousRoutes.reviewInvoicePaymentComplete}
          element={<ReviewInvoicePaymentCompletePage />}
        />
        <Route
          path={anonymousRoutes.resetPassword}
          element={<ResetPasswordPage />}
        />
        <Route
          path={anonymousRoutes.forgotPassword}
          element={<ForgotPasswordPage />}
        />
        <Route
          path={anonymousRoutes.createVendor}
          element={<VendorFormPage />}
        />
        <Route
          path={anonymousRoutes.createVendorComplete}
          element={<AnonymousCompletePage />}
        />
        {/* Bank and Company user routes */}
        <Route
          path={routes.root}
          element={
            <PrivateRoute
              requiredRoles={[
                UserRolesEnum.BankAdmin,
                UserRolesEnum.BankReadOnly,
                UserRolesEnum.CompanyAdmin,
                UserRolesEnum.CompanyReadOnly,
              ]}
            >
              {isRoleBankUser(role) ? (
                <Navigate replace to={bankRoutes.overview} />
              ) : (
                <Navigate replace to={customerRoutes.overview} />
              )}
            </PrivateRoute>
          }
        />
        <Route
          path={routes.userProfile}
          element={
            <PrivateRoute
              requiredRoles={[
                UserRolesEnum.BankAdmin,
                UserRolesEnum.BankReadOnly,
                UserRolesEnum.CompanyAdmin,
                UserRolesEnum.CompanyReadOnly,
              ]}
            >
              <UserProfile />
            </PrivateRoute>
          }
        />
        {/* Customer user routes */}
        <Route
          path={customerRoutes.overview}
          element={
            <PrivateRoute
              requiredRoles={[
                UserRolesEnum.CompanyAdmin,
                UserRolesEnum.CompanyReadOnly,
              ]}
            >
              <CustomerOverviewPage />
            </PrivateRoute>
          }
        />
        <Route
          path={customerRoutes.contract}
          element={
            <PrivateRoute
              requiredRoles={[
                UserRolesEnum.CompanyAdmin,
                UserRolesEnum.CompanyReadOnly,
              ]}
            >
              <CustomerContractPage />
            </PrivateRoute>
          }
        />
        <Route
          path={customerRoutes.reports}
          element={
            <PrivateRoute
              requiredRoles={[
                UserRolesEnum.CompanyAdmin,
                UserRolesEnum.CompanyReadOnly,
              ]}
            >
              <CustomerReportsPage />
            </PrivateRoute>
          }
        />
        <Route
          path={customerRoutes.borrowingBase}
          element={
            <PrivateRoute
              requiredRoles={[
                UserRolesEnum.CompanyAdmin,
                UserRolesEnum.CompanyReadOnly,
              ]}
            >
              <CustomerBorrowingBasePage />
            </PrivateRoute>
          }
        />
        <Route
          path={customerRoutes.financialCertifications}
          element={
            <PrivateRoute
              requiredRoles={[
                UserRolesEnum.CompanyAdmin,
                UserRolesEnum.CompanyReadOnly,
              ]}
            >
              <CustomerFinancialCertificationsPage />
            </PrivateRoute>
          }
        />
        <Route
          path={customerRoutes.financingRequests}
          element={
            <PrivateRoute
              requiredRoles={[
                UserRolesEnum.CompanyAdmin,
                UserRolesEnum.CompanyReadOnly,
              ]}
            >
              <CustomerFinancingRequestsPage />
            </PrivateRoute>
          }
        />
        <Route
          path={customerRoutes.loans}
          element={
            <PrivateRoute
              requiredRoles={[
                UserRolesEnum.CompanyAdmin,
                UserRolesEnum.CompanyReadOnly,
              ]}
            >
              <CustomerLoansPageNew />
            </PrivateRoute>
          }
        />

        <Route
          path={customerRoutes.locations}
          element={
            <PrivateRoute
              requiredRoles={[
                UserRolesEnum.CompanyAdmin,
                UserRolesEnum.CompanyReadOnly,
              ]}
            >
              <CustomerLocationsPage />
            </PrivateRoute>
          }
        />
        <Route
          path={customerRoutes.purchaseOrders}
          element={
            <PrivateRoute
              requiredRoles={[
                UserRolesEnum.CompanyAdmin,
                UserRolesEnum.CompanyReadOnly,
              ]}
            >
              <CustomerPurchaseOrdersPage />
            </PrivateRoute>
          }
        />
        <Route
          path={customerRoutes.invoices}
          element={
            <PrivateRoute
              requiredRoles={[
                UserRolesEnum.CompanyAdmin,
                UserRolesEnum.CompanyReadOnly,
              ]}
            >
              <CustomerInvoicesPages />
            </PrivateRoute>
          }
        />
        <Route
          path={customerRoutes.repayments}
          element={
            <PrivateRoute
              requiredRoles={[
                UserRolesEnum.CompanyAdmin,
                UserRolesEnum.CompanyReadOnly,
              ]}
            >
              <CustomerRepaymentsPage />
            </PrivateRoute>
          }
        />
        <Route
          path={customerRoutes.settings}
          element={
            <PrivateRoute
              requiredRoles={[
                UserRolesEnum.CompanyAdmin,
                UserRolesEnum.CompanyReadOnly,
              ]}
            >
              <CustomerSettingsPage />
            </PrivateRoute>
          }
        />
        <Route
          path={customerRoutes.vendors}
          element={
            <PrivateRoute
              requiredRoles={[
                UserRolesEnum.CompanyAdmin,
                UserRolesEnum.CompanyReadOnly,
              ]}
            >
              <CustomerVendorsPage />
            </PrivateRoute>
          }
        />
        <Route
          path={customerRoutes.payors}
          element={
            <PrivateRoute
              requiredRoles={[
                UserRolesEnum.CompanyAdmin,
                UserRolesEnum.CompanyReadOnly,
              ]}
            >
              <CustomerPayorsPage />
            </PrivateRoute>
          }
        />
        <Route
          path={customerRoutes.account}
          element={
            <PrivateRoute
              requiredRoles={[
                UserRolesEnum.CompanyAdmin,
                UserRolesEnum.CompanyReadOnly,
              ]}
            >
              <CustomerAccountPage />
            </PrivateRoute>
          }
        />

        {/* Bank user routes */}
        <Route
          path={bankRoutes.overview}
          element={
            <PrivateRoute
              requiredRoles={[
                UserRolesEnum.BankAdmin,
                UserRolesEnum.BankReadOnly,
              ]}
            >
              <BankOverviewPage />
            </PrivateRoute>
          }
        />
        <Route
          path={bankRoutes.financingRequests}
          element={
            <PrivateRoute
              requiredRoles={[
                UserRolesEnum.BankAdmin,
                UserRolesEnum.BankReadOnly,
              ]}
            >
              <BankFinancingRequestsPage />
            </PrivateRoute>
          }
        />
        <Route
          path={bankRoutes.loans}
          element={
            <PrivateRoute
              requiredRoles={[
                UserRolesEnum.BankAdmin,
                UserRolesEnum.BankReadOnly,
              ]}
            >
              <BankLoansPageNew />
            </PrivateRoute>
          }
        />
        <Route
          path={bankRoutes.metrcRoot}
          element={
            <PrivateRoute
              requiredRoles={[
                UserRolesEnum.BankAdmin,
                UserRolesEnum.BankReadOnly,
              ]}
            >
              <BankMetrcPage />
            </PrivateRoute>
          }
        />
        <Route
          path={bankRoutes.async}
          element={
            <PrivateRoute
              requiredRoles={[
                UserRolesEnum.BankAdmin,
                UserRolesEnum.BankReadOnly,
              ]}
            >
              <BankAsyncPage />
            </PrivateRoute>
          }
        />
        <Route
          path={bankRoutes.purchaseOrdersNew}
          element={
            <PrivateRoute
              requiredRoles={[
                UserRolesEnum.BankAdmin,
                UserRolesEnum.BankReadOnly,
              ]}
            >
              <BankPurchaseOrdersPageNew />
            </PrivateRoute>
          }
        />
        <Route
          path={bankRoutes.invoices}
          element={
            <PrivateRoute
              requiredRoles={[
                UserRolesEnum.BankAdmin,
                UserRolesEnum.BankReadOnly,
              ]}
            >
              <BankInvoicesPage />
            </PrivateRoute>
          }
        />
        <Route
          path={bankRoutes.companies}
          element={
            <PrivateRoute
              requiredRoles={[
                UserRolesEnum.BankAdmin,
                UserRolesEnum.BankReadOnly,
              ]}
            >
              <BankCompaniesPage />
            </PrivateRoute>
          }
        />
        <Route
          path={bankRoutes.debtFacility}
          element={
            <PrivateRoute
              requiredRoles={[
                UserRolesEnum.BankAdmin,
                UserRolesEnum.BankReadOnly,
              ]}
            >
              <BankDebtFacilityPage />
            </PrivateRoute>
          }
        />
        <Route
          path={bankRoutes.customers}
          element={
            <PrivateRoute
              requiredRoles={[
                UserRolesEnum.BankAdmin,
                UserRolesEnum.BankReadOnly,
              ]}
            >
              <BankCustomersPage />
            </PrivateRoute>
          }
        />
        <Route
          path={"companies/:companyId/overview"}
          element={
            <PrivateRoute
              requiredRoles={[
                UserRolesEnum.BankAdmin,
                UserRolesEnum.BankReadOnly,
              ]}
            >
              <BankCompanyCustomerOverviewPage />
            </PrivateRoute>
          }
        />
        <Route
          path={"companies/:companyId/purchase-orders"}
          element={
            <PrivateRoute
              requiredRoles={[
                UserRolesEnum.BankAdmin,
                UserRolesEnum.BankReadOnly,
              ]}
            >
              <BankCompanyCustomerPurchaseOrdersPage />
            </PrivateRoute>
          }
        />
        <Route
          path={"companies/:companyId/loans"}
          element={
            <PrivateRoute
              requiredRoles={[
                UserRolesEnum.BankAdmin,
                UserRolesEnum.BankReadOnly,
              ]}
            >
              <BankCompanyCustomerLoansPage />
            </PrivateRoute>
          }
        />
        <Route
          path={"companies/:companyId/financial-certifications"}
          element={
            <PrivateRoute
              requiredRoles={[
                UserRolesEnum.BankAdmin,
                UserRolesEnum.BankReadOnly,
              ]}
            >
              <BankCompanyCustomerFinancialCertificationsPage />
            </PrivateRoute>
          }
        />
        <Route
          path={"companies/:companyId/borrowing-base"}
          element={
            <PrivateRoute
              requiredRoles={[
                UserRolesEnum.BankAdmin,
                UserRolesEnum.BankReadOnly,
              ]}
            >
              <BankCompanyCustomerBorrowingBasePage />
            </PrivateRoute>
          }
        />
        <Route
          path={"companies/:companyId/financing-requests"}
          element={
            <PrivateRoute
              requiredRoles={[
                UserRolesEnum.BankAdmin,
                UserRolesEnum.BankReadOnly,
              ]}
            >
              <BankCompanyCustomerFinancingRequestsPage />
            </PrivateRoute>
          }
        />
        <Route
          path={"companies/:companyId/contract"}
          element={
            <PrivateRoute
              requiredRoles={[
                UserRolesEnum.BankAdmin,
                UserRolesEnum.BankReadOnly,
              ]}
            >
              <BankCompanyCustomerContractPage />
            </PrivateRoute>
          }
        />
        <Route
          path={"companies/:companyId/invoices"}
          element={
            <PrivateRoute
              requiredRoles={[
                UserRolesEnum.BankAdmin,
                UserRolesEnum.BankReadOnly,
              ]}
            >
              <BankCompanyCustomerInvoicesPage />
            </PrivateRoute>
          }
        />
        <Route
          path={"companies/:companyId/repayments"}
          element={
            <PrivateRoute
              requiredRoles={[
                UserRolesEnum.BankAdmin,
                UserRolesEnum.BankReadOnly,
              ]}
            >
              <BankCompanyCustomerRepaymentsPage />
            </PrivateRoute>
          }
        />
        <Route
          path={"companies/:companyId/vendors"}
          element={
            <PrivateRoute
              requiredRoles={[
                UserRolesEnum.BankAdmin,
                UserRolesEnum.BankReadOnly,
              ]}
            >
              <BankCompanyCustomerVendorsPage />
            </PrivateRoute>
          }
        />
        <Route
          path={"companies/:companyId/payors"}
          element={
            <PrivateRoute
              requiredRoles={[
                UserRolesEnum.BankAdmin,
                UserRolesEnum.BankReadOnly,
              ]}
            >
              <BankCompanyCustomerPayorsPage />
            </PrivateRoute>
          }
        />
        <Route
          path={"companies/:companyId/reports"}
          element={
            <PrivateRoute
              requiredRoles={[
                UserRolesEnum.BankAdmin,
                UserRolesEnum.BankReadOnly,
              ]}
            >
              <BankCompanyCustomerReportsPage />
            </PrivateRoute>
          }
        />

        <Route
          path={"companies/:companyId/vendor-partnerships"}
          element={
            <PrivateRoute
              requiredRoles={[
                UserRolesEnum.BankAdmin,
                UserRolesEnum.BankReadOnly,
              ]}
            >
              <BankCompanyVendorPartnershipsPage />
            </PrivateRoute>
          }
        />

        <Route
          path={"companies/:companyId/payor-partnerships"}
          element={
            <PrivateRoute
              requiredRoles={[
                UserRolesEnum.BankAdmin,
                UserRolesEnum.BankReadOnly,
              ]}
            >
              <BankCompanyPayorPartnershipsPage />
            </PrivateRoute>
          }
        />

        <Route
          path={"companies/:companyId/settings"}
          element={
            <PrivateRoute
              requiredRoles={[
                UserRolesEnum.BankAdmin,
                UserRolesEnum.BankReadOnly,
              ]}
            >
              <BankCompanyCustomerSettingsPage />
            </PrivateRoute>
          }
        />
        <Route
          path={"companies/:companyId/metrc"}
          element={
            <PrivateRoute
              requiredRoles={[
                UserRolesEnum.BankAdmin,
                UserRolesEnum.BankReadOnly,
              ]}
            >
              <BankCompanyCustomerMetrcPage />
            </PrivateRoute>
          }
        />
        <Route
          path={"companies/:companyId/account"}
          element={
            <PrivateRoute
              requiredRoles={[
                UserRolesEnum.BankAdmin,
                UserRolesEnum.BankReadOnly,
              ]}
            >
              <BankCompanyCustomerAccountPage />
            </PrivateRoute>
          }
        />

        <Route
          path={bankRoutes.ebbaApplications}
          element={
            <PrivateRoute
              requiredRoles={[
                UserRolesEnum.BankAdmin,
                UserRolesEnum.BankReadOnly,
              ]}
            >
              <BankClientSurveillancePage />
            </PrivateRoute>
          }
        />
        <Route
          path={bankRoutes.advances}
          element={
            <PrivateRoute
              requiredRoles={[
                UserRolesEnum.BankAdmin,
                UserRolesEnum.BankReadOnly,
              ]}
            >
              <BankAdvancesPage />
            </PrivateRoute>
          }
        />
        <Route
          path={bankRoutes.repayments}
          element={
            <PrivateRoute
              requiredRoles={[
                UserRolesEnum.BankAdmin,
                UserRolesEnum.BankReadOnly,
              ]}
            >
              <BankRepaymentsPage />
            </PrivateRoute>
          }
        />
        <Route
          path={bankRoutes.vendors}
          element={
            <PrivateRoute
              requiredRoles={[
                UserRolesEnum.BankAdmin,
                UserRolesEnum.BankReadOnly,
              ]}
            >
              <BankVendorsPage />
            </PrivateRoute>
          }
        />
        <Route
          path={bankRoutes.payors}
          element={
            <PrivateRoute
              requiredRoles={[
                UserRolesEnum.BankAdmin,
                UserRolesEnum.BankReadOnly,
              ]}
            >
              <BankPayorsPage />
            </PrivateRoute>
          }
        />
        <Route
          path={bankRoutes.partnerships}
          element={
            <PrivateRoute
              requiredRoles={[
                UserRolesEnum.BankAdmin,
                UserRolesEnum.BankReadOnly,
              ]}
            >
              <BankPartnershipsPage />
            </PrivateRoute>
          }
        />
        <Route
          path={bankRoutes.reports}
          element={
            <PrivateRoute
              requiredRoles={[
                UserRolesEnum.BankAdmin,
                UserRolesEnum.BankReadOnly,
              ]}
            >
              <BankReportsPage />
            </PrivateRoute>
          }
        />
        <Route
          path={bankRoutes.settings}
          element={
            <PrivateRoute
              requiredRoles={[
                UserRolesEnum.BankAdmin,
                UserRolesEnum.BankReadOnly,
              ]}
            >
              <BankSettingsPage />
            </PrivateRoute>
          }
        />
        <Route
          path={bankRoutes.productCatalog}
          element={
            <PrivateRoute
              requiredRoles={[
                UserRolesEnum.BankAdmin,
                UserRolesEnum.BankReadOnly,
              ]}
            >
              <BankProductCatalogPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
