import BankCompanyPage from "pages/Bank/Company/BankCompanyPage";
import CustomerOverviewPageContent from "pages/Customer/Overview/OverviewPageContent";

export default function BankCompanyCustomerOverviewPage() {
  return (
    <BankCompanyPage>
      {({ companyId, productType, isActiveContract }) => (
        <CustomerOverviewPageContent
          companyId={companyId}
          productType={productType}
          isActiveContract={isActiveContract}
        />
      )}
    </BankCompanyPage>
  );
}
