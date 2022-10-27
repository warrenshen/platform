import CurrentCustomerProvider from "contexts/CurrentCustomerProvider";
import { Companies } from "generated/graphql";
import { ProductTypeEnum } from "lib/enum";
import CustomerOverviewPageContent from "pages/Customer/Overview/OverviewPageContent";

interface Props {
  companyId: Companies["id"];
  productType: ProductTypeEnum | null;
  isActiveContract: boolean;
}

export default function BankCustomerOverviewSubpage({
  companyId,
  productType,
  isActiveContract,
}: Props) {
  return !!productType ? (
    <CurrentCustomerProvider companyId={companyId}>
      <CustomerOverviewPageContent
        companyId={companyId}
        productType={productType}
        isActiveContract={isActiveContract}
      />
    </CurrentCustomerProvider>
  ) : null;
}
