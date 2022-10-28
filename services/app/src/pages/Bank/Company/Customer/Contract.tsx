import { Box } from "@material-ui/core";
import BankCompanyPage from "pages/Bank/Company/BankCompanyPage";
import CustomerContractPageContent from "pages/Customer/Contract/ContractPageContent";

export default function BankCompanyCustomerContractPage() {
  return (
    <BankCompanyPage>
      {({ companyId, productType, isActiveContract }) => (
        <Box width={`calc(100% - 200px)`}>
          <CustomerContractPageContent companyId={companyId} />
        </Box>
      )}
    </BankCompanyPage>
  );
}
