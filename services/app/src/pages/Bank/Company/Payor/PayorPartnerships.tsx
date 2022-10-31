import BankCompanyPage from "pages/Bank/Company/BankCompanyPage";
import CustomerPayorPartnershipsPageContent from "pages/Bank/Company/PayorPartnerships";

export default function BankCompanyCustomerVendorPartnershipsPage() {
  return (
    <BankCompanyPage>
      {({ companyId, productType, isActiveContract }) => (
        <CustomerPayorPartnershipsPageContent companyId={companyId} />
      )}
    </BankCompanyPage>
  );
}
