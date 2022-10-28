import { Box } from "@material-ui/core";
import BankCompanyPage from "pages/Bank/Company/BankCompanyPage";
import CustomerFinancingRequestsPageContent from "pages/Customer/FinancingRequests/FinancingRequestsPageContent";

export default function BankCompanyCustomerFinancingRequestsPage() {
  return (
    <BankCompanyPage>
      {({ companyId, productType, isActiveContract }) => (
        <Box width={`calc(100% - 200px)`}>
          <CustomerFinancingRequestsPageContent
            companyId={companyId}
            productType={productType}
            isActiveContract={isActiveContract}
          />
        </Box>
      )}
    </BankCompanyPage>
  );
}
