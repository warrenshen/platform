import { Companies } from "generated/graphql";
import { ProductTypeEnum } from "lib/enum";
import BorrowingBasePageContent from "pages/Customer/BorrowingBase/BorrowingBasePageContent";

interface Props {
  companyId: Companies["id"];
  productType: ProductTypeEnum;
  isActiveContract: boolean;
}

export default function BankCustomerBorrowingBaseSubpage({
  companyId,
  productType,
  isActiveContract,
}: Props) {
  return (
    <BorrowingBasePageContent
      companyId={companyId}
      productType={productType}
      isActiveContract={isActiveContract}
    />
  );
}
