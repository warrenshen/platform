import { Box } from "@material-ui/core";
import BankCompanyPage from "pages/Bank/Company/BankCompanyPage";
import CustomerPayorsPageContent from "pages/Customer/Payors/PayorsPageContent";

export default function BankCompanyCustomerPayorsPage() {
  return (
    <BankCompanyPage>
      {({ companyId, productType, isActiveContract }) => (
        <Box width={`calc(100% - 200px)`}>
          <CustomerPayorsPageContent
            companyId={companyId}
            isActiveContract={isActiveContract}
          />
        </Box>
      )}
    </BankCompanyPage>
  );
}
