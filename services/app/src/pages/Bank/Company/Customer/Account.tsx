import { Box } from "@material-ui/core";
import BankCompanyPage from "pages/Bank/Company/BankCompanyPage";
import CustomerAccountPageContent from "pages/Customer/AccountFeesCredits/AccountFeesCreditsPageContent";

export default function BankCompanyCustomerAccountPage() {
  return (
    <BankCompanyPage>
      {({ companyId, productType, isActiveContract }) => (
        <Box width={`calc(100% - 200px)`}>
          <CustomerAccountPageContent
            companyId={companyId}
            productType={productType}
          />
        </Box>
      )}
    </BankCompanyPage>
  );
}
