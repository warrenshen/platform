import CurrentCustomerProvider from "contexts/CurrentCustomerProvider";
import { Companies } from "generated/graphql";
import { ProductTypeEnum } from "lib/enum";
import CustomerLoansPageContent from "pages/Customer/Loans/LoansPageContent";

interface Props {
  companyId: Companies["id"];
  productType: ProductTypeEnum | null;
  isActiveContract: boolean;
}

export default function BankCustomerLoansSubpage({
  companyId,
  productType,
  isActiveContract,
}: Props) {
  return (
    !!productType && (
      <CurrentCustomerProvider companyId={companyId}>
        <CustomerLoansPageContent
          companyId={companyId}
          productType={productType}
          isActiveContract={isActiveContract}
        />
      </CurrentCustomerProvider>
    )
  );
}
