import { Companies, ProductTypeEnum } from "generated/graphql";
import CurrentCustomerProvider from "contexts/CurrentCustomerProvider";
import CustomerLoansPageContent from "pages/Customer/Loans/LoansPageContent";

interface Props {
  companyId: Companies["id"];
  productType: ProductTypeEnum | null;
}

export default function BankCustomerLoansSubpage({
  companyId,
  productType,
}: Props) {
  return (
    !!productType && (
      <CurrentCustomerProvider companyId={companyId}>
        <CustomerLoansPageContent
          companyId={companyId}
          productType={productType}
        />
      </CurrentCustomerProvider>
    )
  );
}
