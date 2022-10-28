import BankCompanyPage from "pages/Bank/Company/BankCompanyPage";
import CustomerAccountPageContent from "pages/Customer/AccountFeesCredits/AccountFeesCreditsPageContent";

export default function BankCompanyCustomerAccountPage() {
  return (
    <BankCompanyPage>
      {({ companyId, productType, isActiveContract }) => (
        <CustomerAccountPageContent
          companyId={companyId}
          productType={productType}
        />
      )}
    </BankCompanyPage>
  );
}
