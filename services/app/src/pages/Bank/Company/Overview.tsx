import { Companies } from "generated/graphql";
import { ProductTypeEnum } from "lib/enum";
import CurrentCustomerProvider from "contexts/CurrentCustomerProvider";
import CustomerOverviewPageContent from "pages/Customer/Overview/OverviewPageContent";

interface Props {
  companyId: Companies["id"];
  productType: ProductTypeEnum | null;
}

export default function BankCustomerOverviewSubpage({
  companyId,
  productType,
}: Props) {
  return (
    !!productType && (
      <CurrentCustomerProvider companyId={companyId}>
        <CustomerOverviewPageContent
          companyId={companyId}
          productType={productType}
        />
      </CurrentCustomerProvider>
    )
  );
}
