import CustomerEbbaApplicationsPageContent from "pages/Customer/EbbaApplications/EbbaApplicationsPageContent";
import { Companies } from "generated/graphql";
import { ProductTypeEnum } from "lib/enum";

interface Props {
  companyId: Companies["id"];
  productType: ProductTypeEnum;
}

export default function BankCustomerEbbaApplicationsSubpage({
  companyId,
  productType,
}: Props) {
  return (
    <CustomerEbbaApplicationsPageContent
      companyId={companyId}
      productType={productType}
    />
  );
}
