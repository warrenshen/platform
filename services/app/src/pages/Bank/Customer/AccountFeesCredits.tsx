import { Companies, ProductTypeEnum } from "generated/graphql";
import CurrentCustomerProvider from "contexts/CurrentCustomerProvider";
import CustomerAccountPageContent from "pages/Customer/AccountFeesCredits/AccountFeesCreditsPageContent";

interface Props {
  companyId: Companies["id"];
  productType: ProductTypeEnum | null;
}

export default function BankCustomerAccountFeesCreditsSubpage({
  companyId,
  productType,
}: Props) {
  return (
    !!productType && (
      <CurrentCustomerProvider companyId={companyId}>
        <CustomerAccountPageContent
          companyId={companyId}
          productType={productType}
        />
      </CurrentCustomerProvider>
    )
  );
}
