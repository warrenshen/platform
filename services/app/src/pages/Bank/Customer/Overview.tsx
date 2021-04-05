import { ProductTypeEnum } from "generated/graphql";
import CustomerOverviewPageContent from "pages/Customer/Overview/OverviewPageContent";

interface Props {
  companyId: string;
  productType: ProductTypeEnum;
}

function CustomerOverviewSubpage({ companyId, productType }: Props) {
  return (
    <CustomerOverviewPageContent
      companyId={companyId}
      productType={productType}
    />
  );
}

export default CustomerOverviewSubpage;
