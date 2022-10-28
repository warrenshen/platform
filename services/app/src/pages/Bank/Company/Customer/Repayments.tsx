import { Box } from "@material-ui/core";
import BankCompanyPage from "pages/Bank/Company/BankCompanyPage";
import CustomerRepaymentsPageContent from "pages/Customer/Repayments/RepaymentsPageContent";

export default function BankCompanyCustomerRepaymentsPage() {
  return (
    <BankCompanyPage>
      {({ companyId, productType, isActiveContract }) => (
        <Box width={`calc(100% - 200px)`}>
          <CustomerRepaymentsPageContent
            companyId={companyId}
            productType={productType}
          />
        </Box>
      )}
    </BankCompanyPage>
  );
}
