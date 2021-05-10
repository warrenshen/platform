import { Companies, ProductTypeEnum } from "generated/graphql";
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
      <CustomerLoansPageContent
        companyId={companyId}
        productType={productType}
      />
    )
  );
}
