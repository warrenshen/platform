import { Companies } from "generated/graphql";
import CustomerEbbaApplicationsPageContent from "pages/Customer/EbbaApplications/EbbaApplicationsPageContent";
import { ProductTypeEnum } from "generated/graphql";

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
