import BankCompanyPage from "pages/Bank/Company/BankCompanyPage";
import CustomerContractPageContent from "pages/Customer/Contract/ContractPageContent";

export default function BankCompanyCustomerContractPage() {
  return (
    <BankCompanyPage>
      {({ companyId, productType, isActiveContract }) => (
        <CustomerContractPageContent companyId={companyId} />
      )}
    </BankCompanyPage>
  );
}
