import BankCompanyPage from "pages/Bank/Company/BankCompanyPage";
import CustomerBorrowingBasePageContent from "pages/Customer/BorrowingBase/BorrowingBasePageContent";

export default function BankCompanyCustomerBorrowingBasePage() {
  return (
    <BankCompanyPage>
      {({ companyId, productType, isActiveContract }) => (
        <CustomerBorrowingBasePageContent
          companyId={companyId}
          productType={productType}
          isActiveContract={isActiveContract}
        />
      )}
    </BankCompanyPage>
  );
}
