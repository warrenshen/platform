import { Companies } from "generated/graphql";
import { ProductTypeEnum } from "lib/enum";
import CustomerVendorsPageContent from "pages/Customer/Vendors/VendorsPageContent";

interface Props {
  companyId: Companies["id"];
  productType: ProductTypeEnum;
}

export default function BankCustomerVendorsSubpage({
  companyId,
  productType,
}: Props) {
  return (
    <CustomerVendorsPageContent
      companyId={companyId}
      productType={productType}
    />
  );
}
