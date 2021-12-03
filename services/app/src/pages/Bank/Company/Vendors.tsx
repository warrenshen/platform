import { Companies } from "generated/graphql";
import CustomerVendorsPageContent from "pages/Customer/Vendors/VendorsPageContent";
import { ProductTypeEnum } from "lib/enum";

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
