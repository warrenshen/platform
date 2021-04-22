import { ProductTypeEnum } from "generated/graphql";
import CustomerAccountPageContent from "pages/Customer/AccountFeesCredits/AccountFeesCreditsPageContent";

interface Props {
  companyId: string;
  productType: ProductTypeEnum;
}

export default function BankCustomerAccountFeesCreditsSubpage({
  companyId,
  productType,
}: Props) {
  return (
    <CustomerAccountPageContent
      companyId={companyId}
      productType={productType}
    />
  );
}
