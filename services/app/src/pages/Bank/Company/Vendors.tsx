import { Companies } from "generated/graphql";
import { ProductTypeEnum } from "lib/enum";
import CustomerVendorsPageContent from "pages/Customer/Vendors/VendorsPageContent";

interface Props {
  companyId: Companies["id"];
  productType: ProductTypeEnum;
  isActiveContract: boolean;
}

export default function BankCustomerVendorsSubpage({
  companyId,
  productType,
  isActiveContract,
}: Props) {
  return (
    <CustomerVendorsPageContent
      companyId={companyId}
      productType={productType}
      isActiveContract={isActiveContract}
    />
  );
}
