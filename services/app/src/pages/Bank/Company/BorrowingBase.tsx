import BorrowingBasePageContent from "pages/Customer/BorrowingBase/BorrowingBasePageContent";
import { Companies } from "generated/graphql";
import { ProductTypeEnum } from "lib/enum";

interface Props {
  companyId: Companies["id"];
  productType: ProductTypeEnum;
}

export default function BankCustomerBorrowingBaseSubpage({
  companyId,
  productType,
}: Props) {
  return (
    <BorrowingBasePageContent companyId={companyId} productType={productType} />
  );
}
