import BankCompanyPage from "pages/Bank/Company/BankCompanyPage";
import CustomerFinancingRequestsPageContent from "pages/Customer/FinancingRequests/FinancingRequestsPageContent";

export default function BankCompanyCustomerFinancingRequestsPage() {
  return (
    <BankCompanyPage>
      {({ companyId, productType, isActiveContract }) => (
        <CustomerFinancingRequestsPageContent
          companyId={companyId}
          productType={productType}
          isActiveContract={isActiveContract}
        />
      )}
    </BankCompanyPage>
  );
}
