import { Box } from "@material-ui/core";
import BankCompanyPage from "pages/Bank/Company/BankCompanyPage";
import CustomerMetrcPageContent from "pages/Bank/Company/Metrc";

export default function BankCompanyCustomerMetrcPage() {
  return (
    <BankCompanyPage>
      {({ companyId, productType, isActiveContract }) => (
        <Box width={`calc(100% - 200px)`}>
          <CustomerMetrcPageContent companyId={companyId} />
        </Box>
      )}
    </BankCompanyPage>
  );
}
