import { Companies, ProductTypeEnum } from "generated/graphql";
import CurrentCustomerProvider from "contexts/CurrentCustomerProvider";
import CustomerReportsPageContent from "pages/Customer/Reports/ReportsPageContent";

interface Props {
  companyId: Companies["id"];
  productType: ProductTypeEnum;
}

export default function BankCustomerReportsSubpage({
  companyId,
  productType,
}: Props) {
  return (
    <CurrentCustomerProvider companyId={companyId}>
      <CustomerReportsPageContent
        companyId={companyId}
        productType={productType}
      />
    </CurrentCustomerProvider>
  );
}
