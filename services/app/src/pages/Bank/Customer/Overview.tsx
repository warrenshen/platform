import { Companies, ProductTypeEnum } from "generated/graphql";
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
      <CustomerOverviewPageContent
        companyId={companyId}
        productType={productType}
      />
    )
  );
}
