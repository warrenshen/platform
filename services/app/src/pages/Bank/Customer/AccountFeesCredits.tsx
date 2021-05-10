import { Companies, ProductTypeEnum } from "generated/graphql";
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
      <CustomerAccountPageContent
        companyId={companyId}
        productType={productType}
      />
    )
  );
}
