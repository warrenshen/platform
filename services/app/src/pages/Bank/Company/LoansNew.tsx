import CurrentCustomerProvider from "contexts/CurrentCustomerProvider";
import { Companies } from "generated/graphql";
import { ProductTypeEnum } from "lib/enum";
import CustomerLoansPageContentNew from "pages/Customer/LoansNew/LoansPageContentNew";

interface Props {
  companyId: Companies["id"];
  productType: ProductTypeEnum | null;
  isActiveContract: boolean;
}

export default function BankCustomerLoansSubpageNew({
  companyId,
  productType,
  isActiveContract,
}: Props) {
  return (
    !!productType && (
      <CurrentCustomerProvider companyId={companyId}>
        <CustomerLoansPageContentNew
          companyId={companyId}
          productType={productType}
          isActiveContract={isActiveContract}
        />
      </CurrentCustomerProvider>
    )
  );
}
